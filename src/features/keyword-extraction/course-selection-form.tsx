"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getTheoryChaptersByCourseId } from "@/actions/course";

// Define the chapter type based on the database schema
interface Chapter {
  id: number;
  title?: string | null;
  name?: string | null;
  chapterType?: string;
  markdown?: string | null;
  html?: string | null;
  raw_content?: string | null;
  creator?: number | null;
  locked?: boolean | null;
  courseId?: number | null;
  embedding?: number[] | null;
  rowIndex?: number;
  courseName?: string | null;
}

interface CourseSelectionFormProps {
  selectedCourse: string;
  setSelectedCourse: (course: string) => void;
  selectedChapters: string[];
  setSelectedChapters: (chapters: string[]) => void;
  courses: { id: number, name: string | null }[];
  onNext: () => void;
}

export default function CourseSelectionForm({
  selectedCourse,
  setSelectedCourse,
  selectedChapters,
  setSelectedChapters,
  courses,
  onNext,
}: CourseSelectionFormProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch chapters when course selection changes
  useEffect(() => {
    if (!selectedCourse) {
      setChapters([]);
      return;
    }
    
    const fetchChapters = async () => {
      try {
        setLoading(true);
        // Find the course ID from the selected course name
        const selectedCourseObj = courses.find(course => course.name === selectedCourse);
        
        if (selectedCourseObj) {
          const chaptersData = await getTheoryChaptersByCourseId(selectedCourseObj.id);
          setChapters(chaptersData);
        }
      } catch (error) {
        console.error("Error fetching chapters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [selectedCourse, courses]);

  // Get the display name for a chapter
  const getChapterName = (chapter: Chapter): string => {
    // Use title if available, fallback to name, then to ID string
    return chapter.title || chapter.name || `Chapter ${chapter.id}`;
  };

  // Check if a chapter is in the selected chapters
  const isChapterSelected = (chapter: Chapter): boolean => {
    const chapterName = getChapterName(chapter);
    return selectedChapters.includes(chapterName);
  };

  const handleChapterChange = (chapter: Chapter, checked: boolean) => {
    const chapterName = getChapterName(chapter);
    
    if (checked) {
      setSelectedChapters([...selectedChapters, chapterName]);
    } else {
      setSelectedChapters(selectedChapters.filter(c => c !== chapterName));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="course-select">Select Course</Label>
        <Select 
          value={selectedCourse} 
          onValueChange={setSelectedCourse} 
          disabled={loading}
        >
          <SelectTrigger className="w-full" id="course-select">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto bg-black">
            {courses.length === 0 ? (
              <SelectItem value="none" disabled>No courses available</SelectItem>
            ) : (
              courses.map((course) => (
                <SelectItem key={course.id} value={course.name || ""}>
                  {course.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedCourse && (
        <div className="space-y-2">
          <Label>Select Chapters</Label>
          <div className="border rounded-md">
            {loading ? (
              <div className="text-center py-6 text-muted-foreground">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading chapters...
              </div>
            ) : chapters.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No chapters available
              </div>
            ) : (
              <div className="h-60 p-2 overflow-y-auto">
                <div className="space-y-2">
                  {chapters.map((chapter) => (
                    <div key={chapter.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`chapter-${chapter.id}`} 
                        checked={isChapterSelected(chapter)}
                        onCheckedChange={(checked) => 
                          handleChapterChange(chapter, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`chapter-${chapter.id}`} 
                        className="text-sm cursor-pointer"
                      >
                        {getChapterName(chapter)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedChapters.length} chapter(s) selected
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={selectedChapters.length === 0}
          variant={selectedChapters.length === 0 ? "secondary" : "default"}
        >
          Next
        </Button>
      </div>
    </div>
  );
} 