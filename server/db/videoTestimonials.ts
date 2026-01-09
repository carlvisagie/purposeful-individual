import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { videoTestimonials, InsertVideoTestimonial, VideoTestimonial } from "../../drizzle/schema-postgresql";
import { ENV } from "../_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function createVideoTestimonial(
  testimonial: InsertVideoTestimonial
): Promise<VideoTestimonial | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create testimonial: database not available");
    return null;
  }

  try {
    const result = await db.insert(videoTestimonials).values(testimonial);
    const id = result[0].insertId;
    const created = await db
      .select()
      .from(videoTestimonials)
      .where(eq(videoTestimonials.id, Number(id)))
      .limit(1);
    return created[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create testimonial:", error);
    throw error;
  }
}

export async function getVideoTestimonials(): Promise<VideoTestimonial[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get testimonials: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(videoTestimonials)
      .where(eq(videoTestimonials.isPublished, "true"))
      .orderBy(desc(videoTestimonials.displayOrder), desc(videoTestimonials.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get testimonials:", error);
    return [];
  }
}

export async function getVideoTestimonialById(id: number): Promise<VideoTestimonial | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get testimonial: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(videoTestimonials)
      .where(eq(videoTestimonials.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get testimonial:", error);
    return null;
  }
}

export async function updateVideoTestimonial(
  id: number,
  updates: Partial<InsertVideoTestimonial>
): Promise<VideoTestimonial | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update testimonial: database not available");
    return null;
  }

  try {
    await db.update(videoTestimonials).set(updates).where(eq(videoTestimonials.id, id));
    return getVideoTestimonialById(id);
  } catch (error) {
    console.error("[Database] Failed to update testimonial:", error);
    throw error;
  }
}

export async function deleteVideoTestimonial(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete testimonial: database not available");
    return false;
  }

  try {
    await db.delete(videoTestimonials).where(eq(videoTestimonials.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete testimonial:", error);
    throw error;
  }
}

export async function getAllVideoTestimonials(): Promise<VideoTestimonial[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get testimonials: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(videoTestimonials)
      .orderBy(desc(videoTestimonials.displayOrder), desc(videoTestimonials.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get testimonials:", error);
    return [];
  }
}
