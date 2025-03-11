import { Course, Concept } from './types';

// Mock data for demo purposes
// In a real application, this would fetch from a database

const CONCEPTS: Record<string, Concept> = {
  'concept-1': {
    id: 'concept-1',
    name: 'Linear Algebra Basics',
    description: 'Fundamental concepts of linear algebra including vectors and matrices.',
  },
  'concept-2': {
    id: 'concept-2',
    name: 'Matrix Operations',
    description: 'Addition, subtraction, and multiplication of matrices.',
  },
  'concept-3': {
    id: 'concept-3',
    name: 'Vectors',
    description: 'Vector operations and properties in mathematical spaces.',
  },
  'concept-4': {
    id: 'concept-4',
    name: 'Derivatives',
    description: 'Fundamentals of differential calculus.',
  },
  'concept-5': {
    id: 'concept-5',
    name: 'Integrals',
    description: 'Fundamentals of integral calculus.',
  },
  'concept-6': {
    id: 'concept-6',
    name: 'Series and Sequences',
    description: 'Mathematical series, convergence, and sequence properties.',
  },
  'concept-7': {
    id: 'concept-7',
    name: 'Graph Representations',
    description: 'Different ways to represent graphs including adjacency matrices and lists.',
  },
  'concept-8': {
    id: 'concept-8',
    name: 'Graph Traversal',
    description: 'Algorithms for traversing graphs, including depth-first and breadth-first search.',
  },
  'concept-9': {
    id: 'concept-9',
    name: 'Shortest Path Algorithms',
    description: 'Dijkstra\'s and other algorithms for finding shortest paths in graphs.',
  },
};

const COURSES: Course[] = [
  {
    id: 'mathematics-101',
    title: 'Mathematics 101',
    description: 'Introduction to fundamental mathematical concepts',
    longDescription: 'This course provides a comprehensive introduction to fundamental mathematical concepts that serve as the foundation for advanced studies in various fields.',
    level: 'Beginner',
    estimatedHours: 20,
    concepts: [CONCEPTS['concept-1'], CONCEPTS['concept-3']],
  },
  {
    id: 'calculus-fundamentals',
    title: 'Calculus Fundamentals',
    description: 'Core principles of differential and integral calculus',
    longDescription: 'Master the essential concepts of calculus including limits, derivatives, and integrals. This course builds a strong foundation for advanced mathematics and physics.',
    level: 'Intermediate',
    estimatedHours: 30,
    concepts: [CONCEPTS['concept-4'], CONCEPTS['concept-5'], CONCEPTS['concept-6']],
  },
  {
    id: 'graph-theory',
    title: 'Graph Theory',
    description: 'Mathematical structures used to model pairwise relations',
    longDescription: 'Explore the mathematical theory of graphs—structures used to model pairwise relations between objects. Learn about graph representations, traversal algorithms, and applications in computer science.',
    level: 'Advanced',
    estimatedHours: 25,
    concepts: [CONCEPTS['concept-7'], CONCEPTS['concept-8'], CONCEPTS['concept-9']],
  },
];

/**
 * Get all available courses
 */
export async function getCourses(): Promise<Course[]> {
  // In a real application, this would fetch from a database
  return COURSES;
}

/**
 * Get a course by its ID
 */
export async function getCourseById(id: string): Promise<Course | undefined> {
  // In a real application, this would fetch from a database
  return COURSES.find(course => course.id === id);
}

/**
 * Get concepts for a specific course
 */
export async function getCourseConceptsById(id: string): Promise<Concept[]> {
  const course = await getCourseById(id);
  return course?.concepts || [];
} 