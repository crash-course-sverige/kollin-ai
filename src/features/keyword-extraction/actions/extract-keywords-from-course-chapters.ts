"use server";

import { getCourseChapterTexts } from "./get-course-chapter-texts";

interface CreateGraphParams {
  courseId: number;
  chapterIds: number[];
}

export async function extractKeywordsFromCourseChapters({
  courseId,
  chapterIds,
}: CreateGraphParams) {
  console.log("Extracting keywords from course chapters");

  const courseChaptersTexts = await getCourseChapterTexts(courseId, chapterIds);

  const keywords = await extractKeywordsFromSingleChapter(courseChaptersTexts);




  
}