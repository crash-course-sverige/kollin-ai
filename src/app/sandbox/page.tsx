"use client";

import { extractKeywordsFromCourseChapters } from "@/features/keyword-extraction/actions/extract-keywords-from-course-chapters";

export default function SandboxPage() {

  const handleExtractKeywords = async () => {
    const keywords = await extractKeywordsFromCourseChapters({
      courseId: 42,
      chapterIds: [906, 907]
    });

    console.log(keywords);
  }

  return (
    <div>
      <button onClick={handleExtractKeywords}>Extract Keywords</button>
    </div>
  );
}