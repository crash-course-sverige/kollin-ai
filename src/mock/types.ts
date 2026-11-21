/**
 * Mock domain model. Shapes are chosen for the UI, not the database:
 * - A Topic belongs to the SUBJECT, not to a school. KTH's SF1624 and LiU's
 *   TATA24 both cover "Determinant"; the course only decides which topics it
 *   includes, how they are grouped, and how many exam exercises hit them.
 * - Content (theory, questions) is attached to the topic and shared.
 */

export type Block =
  | { t: "h"; text: string }
  | { t: "p"; text: string }
  | { t: "list"; items: string[] }
  | { t: "math"; tex: string };

export type Question = {
  q: string;
  options: string[];
  /** index into options */
  answer: number;
  explain: string;
};

export type TopicContent = {
  blurb: string;
  theory: Block[];
  formulas: string[];
  takeaways: string[];
  questions: Question[];
  minutes: number;
};

export type Topic = {
  id: string;
  name: string;
  /** Present when the AI has written this topic. Absent = "not generated yet". */
  content?: TopicContent;
};

export type CourseTopic = {
  topicId: string;
  /** Index into Course.modules */
  module: number;
  /** Number of exam exercises tagged with this topic in this course. */
  exercises: number;
};

export type Course = {
  code: string;
  name: string;
  school: string;
  schoolShort: string;
  credits: number;
  exams: number;
  modules: string[];
  topics: CourseTopic[];
  /** Hard-coded exam date for the countdown (mock). */
  examDate: string;
};

export type Edge = { from: string; to: string };

export type SubExercise = {
  id: string;
  label: string;
  points: number;
  text: string;
  topics: string[];
  hints: string[];
  answer: string;
};

export type Exercise = {
  id: string;
  number: number;
  title: string;
  points: number;
  intro?: string;
  subs: SubExercise[];
};

export type Exam = {
  id: string;
  course: string;
  title: string;
  date: string;
  exercises: Exercise[];
  /** AI-proposed topics that are not in the graph yet. */
  proposals: TopicProposal[];
};

export type TopicProposal = {
  id: string;
  name: string;
  parent: string;
  module: number;
  /** sub-exercise ids that would carry this topic */
  subs: string[];
  reason: string;
};
