"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { savedJobs } from "@/lib/schema";

async function requireUserId() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
}

export async function saveJob(jobId: string) {
  const userId = await requireUserId();
  await db
    .insert(savedJobs)
    .values({ userId, jobId })
    .onConflictDoNothing();
  revalidatePath("/");
  revalidatePath("/saved");
}

export async function unsaveJob(jobId: string) {
  const userId = await requireUserId();
  await db
    .delete(savedJobs)
    .where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId)));
  revalidatePath("/");
  revalidatePath("/saved");
}

export async function setStatus(jobId: string, status: "saved" | "applied") {
  const userId = await requireUserId();
  await db
    .update(savedJobs)
    .set({
      status,
      appliedAt: status === "applied" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId)));
  revalidatePath("/saved");
}

export async function setNotes(jobId: string, notes: string) {
  const userId = await requireUserId();
  await db
    .update(savedJobs)
    .set({ notes, updatedAt: new Date() })
    .where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId)));
  revalidatePath("/saved");
}
