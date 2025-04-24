"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { chapters } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getCourseChapters(courseId: string) {
  const courseChapters = await db.select().from(courses).where(eq(courses.id, courseId));
  return courseChapters;
}

export async function getAllCourses() {
  const allCourses = await db.select().from(courses);
  return allCourses;
}