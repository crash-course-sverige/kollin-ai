import { db } from "@/lib/db";
import { users, User, NewUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcrypt";

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return result[0];
}

export async function getUserById(id: string): Promise<User | undefined> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  
  return result[0];
}

export async function createUser(userData: Omit<NewUser, "id">): Promise<User> {
  // Hash password if provided
  const userDataToInsert = { ...userData };
  
  if (userData.password) {
    const hashedPassword = await hash(userData.password, 10);
    userDataToInsert.password = hashedPassword;
  }
  
  const result = await db
    .insert(users)
    .values(userDataToInsert)
    .returning();
  
  return result[0];
}

export async function updateUser(id: string, userData: Partial<NewUser>): Promise<User | undefined> {
  // Hash password if provided
  const userDataToUpdate = { ...userData };
  
  if (userData.password) {
    const hashedPassword = await hash(userData.password, 10);
    userDataToUpdate.password = hashedPassword;
  }
  
  // Add updatedAt timestamp
  userDataToUpdate.updatedAt = new Date();
  
  const result = await db
    .update(users)
    .set(userDataToUpdate)
    .where(eq(users.id, id))
    .returning();
  
  return result[0];
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });
  
  return result.length > 0;
} 