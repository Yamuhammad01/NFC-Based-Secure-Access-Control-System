import { Suspense } from "react";
import ScannerClient from "./ScannerClient";

export const dynamic = "force-dynamic";

export default async function ScannerPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const doorId = typeof resolvedSearchParams.doorId === "string" ? resolvedSearchParams.doorId : "";
  const doorName = typeof resolvedSearchParams.doorName === "string" ? resolvedSearchParams.doorName : "";

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
        </main>
      }
    >
      <ScannerClient doorId={doorId} doorName={doorName} />
    </Suspense>
  );
}