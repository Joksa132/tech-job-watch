import { JobList, type JobListSearchParams } from "@/components/job-list";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<JobListSearchParams>;
}) {
  return <JobList searchParams={searchParams} showHidden={false} />;
}
