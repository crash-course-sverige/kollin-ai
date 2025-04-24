"use server";

import { extractKeywordsFromChapters } from "./extract-keywords-from-chapters";
import { getCourseChapterTextData } from "./get-course-chapter-with-text-data";

interface CreateGraphParams {
  courseId: number;
  chapterIds: number[];
}

export async function extractKeywordsFromCourseChapters({
  courseId,
  chapterIds,
}: CreateGraphParams) {
  console.log("Extracting keywords from course chapters");

  const courseChaptersWithTextData = await getCourseChapterTextData(courseId, chapterIds);
  
  const chaptersWithGeneratedKeywords = await extractKeywordsFromChapters(courseChaptersWithTextData);

  return chaptersWithGeneratedKeywords;
}