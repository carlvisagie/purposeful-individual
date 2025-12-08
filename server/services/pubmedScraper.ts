/**
 * PubMed Scraper Service
 * 
 * Scrapes latest medical research from PubMed (NIH National Library of Medicine)
 * PubMed API is free and doesn't require authentication for basic searches
 * 
 * API Documentation: https://www.ncbi.nlm.nih.gov/books/NBK25501/
 */

import { db } from "../db";
import { researchPapers, researchScrapingJobs } from "../../drizzle/researchSchema";
import { eq } from "drizzle-orm";

const PUBMED_BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const PUBMED_SEARCH_URL = `${PUBMED_BASE_URL}/esearch.fcgi`;
const PUBMED_FETCH_URL = `${PUBMED_BASE_URL}/efetch.fcgi`;

interface PubMedSearchResult {
  idlist: string[];
  count: number;
}

interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  doi?: string;
}

/**
 * Search PubMed for articles matching a query
 */
export async function searchPubMed(
  query: string,
  maxResults: number = 20,
  daysBack: number = 30
): Promise<string[]> {
  try {
    // Calculate date range (last N days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const startDateStr = formatPubMedDate(startDate);
    const endDateStr = formatPubMedDate(endDate);

    // Build search URL
    const params = new URLSearchParams({
      db: "pubmed",
      term: query,
      retmode: "json",
      retmax: maxResults.toString(),
      datetype: "pdat", // Publication date
      mindate: startDateStr,
      maxdate: endDateStr,
      sort: "relevance",
    });

    const url = `${PUBMED_SEARCH_URL}?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    const pmids = data.esearchresult?.idlist || [];
    console.log(`Found ${pmids.length} PubMed articles for query: "${query}"`);

    return pmids;
  } catch (error) {
    console.error("Error searching PubMed:", error);
    throw error;
  }
}

/**
 * Fetch full article details from PubMed
 */
export async function fetchPubMedArticles(pmids: string[]): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];

  try {
    const params = new URLSearchParams({
      db: "pubmed",
      id: pmids.join(","),
      retmode: "xml",
      rettype: "abstract",
    });

    const url = `${PUBMED_FETCH_URL}?${params.toString()}`;
    const response = await fetch(url);
    const xmlText = await response.text();

    // Parse XML (simple parsing - in production, use a proper XML parser)
    const articles = parsePubMedXML(xmlText);
    console.log(`Fetched ${articles.length} full articles from PubMed`);

    return articles;
  } catch (error) {
    console.error("Error fetching PubMed articles:", error);
    throw error;
  }
}

/**
 * Simple XML parser for PubMed results
 * In production, use a proper XML parser library
 */
function parsePubMedXML(xml: string): PubMedArticle[] {
  const articles: PubMedArticle[] = [];

  // Split by article tags
  const articleMatches = xml.split("<PubmedArticle>");

  for (let i = 1; i < articleMatches.length; i++) {
    const articleXml = articleMatches[i];

    try {
      // Extract PMID
      const pmidMatch = articleXml.match(/<PMID[^>]*>(\d+)<\/PMID>/);
      const pmid = pmidMatch ? pmidMatch[1] : "";

      // Extract title
      const titleMatch = articleXml.match(/<ArticleTitle>([^<]+)<\/ArticleTitle>/);
      const title = titleMatch ? titleMatch[1] : "";

      // Extract abstract
      const abstractMatch = articleXml.match(/<AbstractText[^>]*>([^<]+)<\/AbstractText>/);
      const abstract = abstractMatch ? abstractMatch[1] : "";

      // Extract authors
      const authorMatches = articleXml.matchAll(/<LastName>([^<]+)<\/LastName>.*?<ForeName>([^<]+)<\/ForeName>/gs);
      const authors: string[] = [];
      for (const match of authorMatches) {
        authors.push(`${match[2]} ${match[1]}`);
      }

      // Extract journal
      const journalMatch = articleXml.match(/<Title>([^<]+)<\/Title>/);
      const journal = journalMatch ? journalMatch[1] : "";

      // Extract publication date
      const yearMatch = articleXml.match(/<PubDate>.*?<Year>(\d{4})<\/Year>/s);
      const monthMatch = articleXml.match(/<PubDate>.*?<Month>(\w+)<\/Month>/s);
      const publicationDate = yearMatch
        ? `${yearMatch[1]}${monthMatch ? `-${monthMatch[1]}` : ""}`
        : "";

      // Extract DOI
      const doiMatch = articleXml.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/);
      const doi = doiMatch ? doiMatch[1] : undefined;

      if (pmid && title) {
        articles.push({
          pmid,
          title,
          abstract,
          authors,
          journal,
          publicationDate,
          doi,
        });
      }
    } catch (error) {
      console.error("Error parsing article XML:", error);
    }
  }

  return articles;
}

/**
 * Format date for PubMed API (YYYY/MM/DD)
 */
function formatPubMedDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

/**
 * Save PubMed articles to database
 */
export async function savePubMedArticles(
  articles: PubMedArticle[],
  relevantModules: string[] = []
): Promise<number> {
  let savedCount = 0;

  for (const article of articles) {
    try {
      // Check if article already exists
      const existing = await db.query.researchPapers.findFirst({
        where: (papers, { eq }) => eq(papers.pubmedId, article.pmid),
      });

      if (existing) {
        console.log(`Article ${article.pmid} already exists, skipping`);
        continue;
      }

      // Insert new article
      await db.insert(researchPapers).values({
        id: `pubmed-${article.pmid}`,
        title: article.title,
        abstract: article.abstract,
        authors: article.authors,
        journal: article.journal,
        publicationDate: article.publicationDate ? new Date(article.publicationDate) : null,
        doi: article.doi,
        pubmedId: article.pmid,
        source: "pubmed",
        sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`,
        relevantModules,
        scrapedAt: new Date(),
        updatedAt: new Date(),
      });

      savedCount++;
      console.log(`Saved article: ${article.title}`);
    } catch (error) {
      console.error(`Error saving article ${article.pmid}:`, error);
    }
  }

  return savedCount;
}

/**
 * Run a PubMed scraping job
 */
export async function runPubMedScrapingJob(jobId: string): Promise<void> {
  try {
    // Get job details
    const job = await db.query.researchScrapingJobs.findFirst({
      where: (jobs, { eq }) => eq(jobs.id, jobId),
    });

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    console.log(`Running PubMed scraping job: ${job.searchQuery}`);

    // Update job status
    await db
      .update(researchScrapingJobs)
      .set({ status: "running", lastRunAt: new Date() })
      .where(eq(researchScrapingJobs.id, jobId));

    // Search PubMed
    const pmids = await searchPubMed(job.searchQuery, 20, 30);

    // Fetch full articles
    const articles = await fetchPubMedArticles(pmids);

    // Save to database
    const savedCount = await savePubMedArticles(articles, job.modules || []);

    // Update job status
    await db
      .update(researchScrapingJobs)
      .set({
        status: "completed",
        papersFound: pmids.length,
        papersAdded: savedCount,
        updatedAt: new Date(),
      })
      .where(eq(researchScrapingJobs.id, jobId));

    console.log(`PubMed scraping job completed: ${savedCount} articles saved`);
  } catch (error) {
    console.error(`Error running PubMed scraping job ${jobId}:`, error);

    // Update job status
    await db
      .update(researchScrapingJobs)
      .set({
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        updatedAt: new Date(),
      })
      .where(eq(researchScrapingJobs.id, jobId));

    throw error;
  }
}

/**
 * Create default scraping jobs for all wellness modules
 */
export async function createDefaultScrapingJobs(): Promise<void> {
  const moduleQueries = [
    { module: "anxiety", query: "anxiety treatment cognitive behavioral therapy" },
    { module: "depression", query: "depression treatment behavioral activation" },
    { module: "sleep", query: "sleep optimization circadian rhythm" },
    { module: "nutrition", query: "nutrition health evidence-based diet" },
    { module: "exercise", query: "exercise fitness health benefits" },
    { module: "stress", query: "stress management cortisol HRV" },
    { module: "adhd", query: "ADHD treatment executive function" },
    { module: "ocd", query: "OCD treatment exposure response prevention" },
    { module: "ptsd", query: "PTSD treatment trauma therapy" },
    { module: "bipolar", query: "bipolar disorder mood stabilization" },
    { module: "longevity", query: "longevity anti-aging NAD+ sirtuins" },
    { module: "supplements", query: "dietary supplements evidence-based" },
    { module: "pain", query: "chronic pain management treatment" },
    { module: "meditation", query: "meditation mindfulness health benefits" },
    { module: "autism", query: "autism intervention neurodiversity" },
  ];

  for (const { module, query } of moduleQueries) {
    try {
      // Check if job already exists
      const existing = await db.query.researchScrapingJobs.findFirst({
        where: (jobs, { and, eq }) =>
          and(eq(jobs.source, "pubmed"), eq(jobs.searchQuery, query)),
      });

      if (existing) {
        console.log(`Scraping job for ${module} already exists`);
        continue;
      }

      // Create new job
      await db.insert(researchScrapingJobs).values({
        id: `pubmed-${module}-${Date.now()}`,
        source: "pubmed",
        searchQuery: query,
        modules: [module],
        status: "pending",
        frequency: "weekly",
        isActive: true,
        nextRunAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`Created scraping job for ${module}: "${query}"`);
    } catch (error) {
      console.error(`Error creating scraping job for ${module}:`, error);
    }
  }
}
