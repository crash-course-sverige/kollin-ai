"use server";

import { db } from "@/lib/db/db";
import { courses } from "@/lib/db/schema/courses.schema";
import { chapters } from "@/lib/db/schema/chapters.schema";
import { eq, and, sql, min } from "drizzle-orm";
import { tagLocations } from "@/lib/db/schema/tag-locations.schema";


export const getTheoryChaptersByCourseId = async (courseId: number) => {
	return await db
		.select({
			rowIndex: sql<number>`ROW_NUMBER() OVER (ORDER BY ${min(chapters.id)})`,
			name: chapters.name,
			id: min(chapters.id),
		})
		.from(chapters)
		.innerJoin(
			sql`tag_content`, 
			and(
				eq(chapters.id, sql`tag_content.chapter_id`),
				sql`tag_content.chapter_type = 'Theory'`
			)
		)
		.innerJoin(
			tagLocations, 
			eq(sql`tag_content.tag_id`, tagLocations.tagId)
		)
		.innerJoin(
			courses, 
			eq(tagLocations.courseId, courses.id)
		)
		.where(eq(tagLocations.courseId, courseId))
		.groupBy(chapters.name);
};

export async function getAllCourses() {
	const allCourses = await db.select({
		id: courses.id,
		name: courses.name,
	}).from(courses).orderBy(courses.id).limit(10);
	return allCourses;
}