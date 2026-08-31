import Link from "next/link";
import { redirect } from "next/navigation";
import { getLatestPublishedEdition } from "@/lib/queries";
import { toISODate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "e-Paper" };

export default async function EpaperIndex() {
  const latest = await getLatestPublishedEdition();
  if (latest) redirect(`/epaper/${toISODate(latest.date)}`);

  return (
    <div className="epaper">
      <div className="epaper-chrome">
        <Link href="/" className="ec-back">
          &larr; chronicle.com
        </Link>
      </div>
      <div className="paper">
        <div className="empty">
          <b>No edition published yet</b>
          Build one in the{" "}
          <Link href="/admin/editions">admin panel</Link>, mark it Published, and it
          will open here.
        </div>
      </div>
    </div>
  );
}
