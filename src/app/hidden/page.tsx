import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { JobList, type JobListSearchParams } from "@/components/job-list";

export default async function HiddenPage({
  searchParams,
}: {
  searchParams: Promise<JobListSearchParams>;
}) {
  const session = await getSession();
  if (!session) redirect("/");
  return <JobList searchParams={searchParams} showHidden={true} />;
}
