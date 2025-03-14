"use server";

import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { flashcardProgress } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";

// Save user's flashcard progress
export async function saveFlashcardProgress(
  flashcardId: number,
  setId: string,
  difficulty: 'easy' | 'medium' | 'hard'
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const userId = session.user.id;
    
    // Check if progress record already exists
    const existingProgress = await db.query.flashcardProgress.findFirst({
      where: and(
        eq(flashcardProgress.userId, userId),
        eq(flashcardProgress.flashcardId, flashcardId),
        eq(flashcardProgress.setId, setId)
      ),
    });

    const now = new Date();
    
    if (existingProgress) {
      // Update existing record
      await db
        .update(flashcardProgress)
        .set({
          difficulty,
          lastReviewed: now,
          reviewCount: existingProgress.reviewCount + 1,
          updatedAt: now,
        })
        .where(
          and(
            eq(flashcardProgress.userId, userId),
            eq(flashcardProgress.flashcardId, flashcardId),
            eq(flashcardProgress.setId, setId)
          )
        );
    } else {
      // Create new record
      await db.insert(flashcardProgress).values({
        userId,
        flashcardId,
        setId,
        difficulty,
        lastReviewed: now,
        reviewCount: 1,
        createdAt: now,
        updatedAt: now,
      });
    }

    revalidatePath('/courses/flashcards');
    return { success: true };
  } catch (error) {
    console.error("Error saving flashcard progress:", error);
    return { error: "Failed to save progress" };
  }
}

// Get all flashcard progress for a user and flashcard set
export async function getFlashcardProgress(setId: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const userId = session.user.id;
    
    const progress = await db.query.flashcardProgress.findMany({
      where: and(
        eq(flashcardProgress.userId, userId),
        eq(flashcardProgress.setId, setId)
      ),
    });
    
    return { progress };
  } catch (error) {
    console.error("Error fetching flashcard progress:", error);
    return { error: "Failed to fetch progress" };
  }
}

// Get summary statistics for a user's flashcard set
export async function getFlashcardStats(setId: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const userId = session.user.id;
    
    const progress = await db.query.flashcardProgress.findMany({
      where: and(
        eq(flashcardProgress.userId, userId),
        eq(flashcardProgress.setId, setId)
      ),
    });
    
    // Calculate statistics
    const totalReviewed = progress.length;
    const easyCount = progress.filter(p => p.difficulty === 'easy').length;
    const mediumCount = progress.filter(p => p.difficulty === 'medium').length;
    const hardCount = progress.filter(p => p.difficulty === 'hard').length;
    
    return { 
      stats: {
        totalReviewed,
        easyCount,
        mediumCount,
        hardCount
      } 
    };
  } catch (error) {
    console.error("Error fetching flashcard stats:", error);
    return { error: "Failed to fetch stats" };
  }
} 