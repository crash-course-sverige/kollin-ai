"use client";

import { useEffect, useState } from "react";

interface CourseSelectionFormProps {
  selectedCourse: string;
  setSelectedCourse: (course: string) => void;
  selectedChapters: string[];
  setSelectedChapters: (chapters: string[]) => void;
  onNext: () => void;
}

export default function CourseSelectionForm({
  selectedCourse,
  setSelectedCourse,
  selectedChapters,
  setSelectedChapters,
  onNext,
}: CourseSelectionFormProps) {
  const [courses, setCourses] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Simulate fetching courses
  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchCourses = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setCourses(['Computer Science 101', 'Data Structures', 'Machine Learning', 'Web Development']);
      setLoading(false);
    };

    fetchCourses();
  }, []);

  // Simulate fetching chapters when a course is selected
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchChapters = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sample chapters based on selected course
      const sampleChapters = {
        'Computer Science 101': ['Introduction to Programming', 'Boolean Logic', 'Data Types', 'Control Structures'],
        'Data Structures': ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Hash Tables'],
        'Machine Learning': ['Supervised Learning', 'Unsupervised Learning', 'Neural Networks', 'Decision Trees'],
        'Web Development': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
      }[selectedCourse] || [];

      setChapters(sampleChapters);
      setSelectedChapters([]);
      setLoading(false);
    };

    fetchChapters();
  }, [selectedCourse, setSelectedChapters]);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(e.target.value);
  };

  const handleChapterChange = (chapter: string) => {
    setSelectedChapters(
      selectedChapters.includes(chapter)
        ? selectedChapters.filter(c => c !== chapter)
        : [...selectedChapters, chapter]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Select Course
        </label>
        <select
          value={selectedCourse}
          onChange={handleCourseChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          disabled={loading}
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Select Chapters
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-300 rounded-md">
            {loading ? (
              <div className="text-center py-4">Loading chapters...</div>
            ) : chapters.length === 0 ? (
              <div className="text-center py-4">No chapters available</div>
            ) : (
              chapters.map((chapter) => (
                <div key={chapter} className="flex items-center">
                  <input
                    type="checkbox"
                    id={chapter}
                    checked={selectedChapters.includes(chapter)}
                    onChange={() => handleChapterChange(chapter)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor={chapter} className="ml-2 text-sm text-white">
                    {chapter}
                  </label>
                </div>
              ))
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {selectedChapters.length} chapter(s) selected
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={selectedChapters.length === 0}
          className={`px-4 py-2 rounded-md text-white ${
            selectedChapters.length === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
} 