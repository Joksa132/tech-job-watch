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

export async function hideJob(jobId: string) {
  const userId = await requireUserId();
  await db
    .insert(savedJobs)
    .values({ userId, jobId, status: "hidden" })
    .onConflictDoUpdate({
      target: [savedJobs.userId, savedJobs.jobId],
      set: { status: "hidden", updatedAt: new Date() },
    });
  revalidatePath("/");
  revalidatePath("/saved");
  revalidatePath("/hidden");
}

export async function unhideJob(jobId: string) {
  const userId = await requireUserId();
  await db
    .delete(savedJobs)
    .where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId)));
  revalidatePath("/");
  revalidatePath("/hidden");
}
