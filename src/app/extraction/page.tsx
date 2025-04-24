import ExtractionSteps from "../../features/keyword-extraction/extraction-steps";
import { getAllCourses } from "@/actions/course";
export default async function ExtractionPage() {
  const courses = await getAllCourses();

  return <ExtractionSteps courses={courses} />;
}