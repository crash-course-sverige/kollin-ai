/**
 * Program → first-year course lookup for the homepage demo picker.
 *
 * AUTHORED for this prototype, not read from `program_plan_courses`. The
 * program names are real; which program maps to which linear-algebra course
 * is a demo assumption. Replace with the production program plans before this
 * goes in front of students.
 */

export type SchoolId = "KTH" | "LiU";

export type Program = {
  id: string;
  school: SchoolId;
  name: string;
  /** Course code from `courses.ts` shown for this program. */
  course: string;
};

export const SCHOOLS: { id: SchoolId; name: string; course: string }[] = [
  { id: "KTH", name: "KTH", course: "SF1624" },
  { id: "LiU", name: "Linköping University", course: "TATA24" },
];

export const PROGRAMS: Program[] = [
  { id: "kth-cdate", school: "KTH", name: "Computer Engineering", course: "SF1624" },
  { id: "kth-ctfys", school: "KTH", name: "Engineering Physics", course: "SF1624" },
  { id: "kth-celte", school: "KTH", name: "Electrical Engineering", course: "SF1624" },
  { id: "kth-cmast", school: "KTH", name: "Mechanical Engineering", course: "SF1624" },
  { id: "liu-d", school: "LiU", name: "Computer Science and Engineering", course: "TATA24" },
  { id: "liu-y", school: "LiU", name: "Engineering Physics and Electrical Engineering", course: "TATA24" },
  { id: "liu-i", school: "LiU", name: "Industrial Engineering and Management", course: "TATA24" },
  { id: "liu-u", school: "LiU", name: "Information Technology", course: "TATA24" },
];
