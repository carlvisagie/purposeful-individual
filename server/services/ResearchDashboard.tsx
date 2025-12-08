import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Microscope, 
  TrendingUp, 
  Search,
  ExternalLink,
  BookOpen,
  Sparkles,
  Filter
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ResearchDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [evidenceFilter, setEvidenceFilter] = useState<"A" | "B" | "C" | "">("");

  // Fetch latest research
  const { data: latestResearch, isLoading: loadingLatest } = trpc.research.getLatestResearch.useQuery({
    module: selectedModule || undefined,
    evidenceLevel: evidenceFilter || undefined,
    limit: 20,
  });

  // Fetch trending research
  const { data: trendingResearch, isLoading: loadingTrending } = trpc.research.getTrendingResearch.useQuery({
    daysBack: 30,
    limit: 10,
  });

  // Fetch research stats
  const { data: stats } = trpc.research.getResearchStats.useQuery();

  // Search research
  const { data: searchResults, refetch: performSearch } = trpc.research.searchResearch.useQuery(
    {
      query: searchQuery,
      evidenceLevel: evidenceFilter || undefined,
      module: selectedModule || undefined,
      limit: 20,
    },
    { enabled: false }
  );

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    performSearch();
  };

  const getEvidenceBadgeColor = (level: string) => {
    switch (level) {
      case "A":
        return "bg-green-600";
      case "B":
        return "bg-blue-600";
      case "C":
        return "bg-yellow-600";
      default:
        return "bg-gray-600";
    }
  };

  const ResearchCard = ({ paper }: { paper: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{paper.title}</CardTitle>
            <CardDescription>
              {paper.authors?.slice(0, 3).join(", ")}
              {paper.authors?.length > 3 && " et al."}
            </CardDescription>
          </div>
          {paper.evidenceLevel && (
            <Badge className={getEvidenceBadgeColor(paper.evidenceLevel)}>
              Level {paper.evidenceLevel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Summary */}
        {paper.aiSummary && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-purple-900">AI Summary</span>
            </div>
            <p className="text-sm text-purple-800">{paper.aiSummary}</p>
          </div>
        )}

        {/* Key Findings */}
        {paper.keyFindings && paper.keyFindings.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Key Findings:</h4>
            <ul className="text-sm space-y-1 ml-4">
              {paper.keyFindings.map((finding: string, i: number) => (
                <li key={i}>• {finding}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {paper.journal && (
            <div>
              <strong>Journal:</strong> {paper.journal}
            </div>
          )}
          {paper.publicationDate && (
            <div>
              <strong>Published:</strong>{" "}
              {new Date(paper.publicationDate).toLocaleDateString()}
            </div>
          )}
          {paper.studyQuality && (
            <div>
              <strong>Quality:</strong> {paper.studyQuality}/10
            </div>
          )}
        </div>

        {/* Relevant Modules */}
        {paper.relevantModules && paper.relevantModules.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Relevant Modules:</h4>
            <div className="flex flex-wrap gap-2">
              {paper.relevantModules.map((module: string) => (
                <Badge key={module} variant="outline">
                  {module}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {paper.sourceUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(paper.sourceUrl, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Paper
            </Button>
          )}
          {paper.pdfUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(paper.pdfUrl, "_blank")}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              PDF
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
          <Microscope className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Truth Seekers 2.0</h1>
          <p className="text-muted-foreground">
            Real-time health research from PubMed, arXiv, and leading journals
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalPapers}</div>
              <div className="text-sm text-muted-foreground">Total Papers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.levelAPapers}</div>
              <div className="text-sm text-muted-foreground">Level A Evidence</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.recentPapers}</div>
              <div className="text-sm text-muted-foreground">Last 30 Days</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.pendingUpdates}</div>
              <div className="text-sm text-muted-foreground">Pending Updates</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Research
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search papers by title or abstract..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Module</label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="All modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All modules</SelectItem>
                  <SelectItem value="anxiety">Anxiety</SelectItem>
                  <SelectItem value="depression">Depression</SelectItem>
                  <SelectItem value="sleep">Sleep</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="longevity">Longevity</SelectItem>
                  {/* Add more modules */}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Evidence Level</label>
              <Select value={evidenceFilter} onValueChange={(v) => setEvidenceFilter(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All levels</SelectItem>
                  <SelectItem value="A">Level A (Highest)</SelectItem>
                  <SelectItem value="B">Level B</SelectItem>
                  <SelectItem value="C">Level C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="latest" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="latest">Latest Research</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="search">Search Results</TabsTrigger>
        </TabsList>

        {/* Latest Research */}
        <TabsContent value="latest" className="space-y-4">
          {loadingLatest ? (
            <div className="text-center py-8">Loading latest research...</div>
          ) : latestResearch && latestResearch.length > 0 ? (
            latestResearch.map((paper) => <ResearchCard key={paper.id} paper={paper} />)
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No research papers found. Check back soon!
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trending Research */}
        <TabsContent value="trending" className="space-y-4">
          {loadingTrending ? (
            <div className="text-center py-8">Loading trending research...</div>
          ) : trendingResearch && trendingResearch.length > 0 ? (
            trendingResearch.map((paper) => <ResearchCard key={paper.id} paper={paper} />)
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No trending research found.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Search Results */}
        <TabsContent value="search" className="space-y-4">
          {searchResults && searchResults.length > 0 ? (
            searchResults.map((paper) => <ResearchCard key={paper.id} paper={paper} />)
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {searchQuery
                  ? "No results found. Try a different search query."
                  : "Enter a search query to find research papers."}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
