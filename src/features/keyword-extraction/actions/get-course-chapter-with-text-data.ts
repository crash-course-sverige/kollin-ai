"use server";

import { and } from "drizzle-orm";

import { chapters } from "@/lib/db/schema/chapters.schema";
import { courses } from "@/lib/db/schema/courses.schema";
import { tagLocations } from "@/lib/db/schema/tag-locations.schema";
import { eq, inArray, not, sql } from "drizzle-orm";
import { tagContent } from "@/lib/db/schema/tag-content.schema";
import { db } from "@/lib/db/db";

export async function getCourseChapterTextData(courseId: number, chapterIds: number[]) {
  if (chapterIds.length === 0) {
    console.log("🚫 No chapter ids provided");
    return [];
  }

  console.log("🔍 Getting course chapters texts for course id:", courseId);

  const results = await db
    .select({
      chapterId: chapters.id,
      title: chapters.title,
      markdown: chapters.markdown,
      courseName: courses.name,
    })
    .from(chapters)
    .innerJoin(
      tagContent,
      and(
        eq(chapters.id, tagContent.chapterId),
        eq(tagContent.chapterType, 'Theory')
      )
    )
    .innerJoin(
      tagLocations,
      eq(tagContent.tagId, tagLocations.tagId)
    )
    .innerJoin(
      courses,
      eq(tagLocations.courseId, courses.id)
    )
    .where(
      and(
        eq(tagLocations.courseId, courseId),
        not(sql`left(${chapters.markdown}, 1) = '!'`),
        inArray(chapters.id, chapterIds)
      )
    )
    .groupBy(chapters.id, chapters.title, chapters.markdown, courses.name);
  
  console.log(`✅ ${results.length} chapter texts retrieved successfully`);
  return results;
}

export type CourseChapterTextData = Awaited<ReturnType<typeof getCourseChapterTextData>>;