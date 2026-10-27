import { notFound } from "next/navigation";
import { Blocks } from "@/blocks/render";
import { getPage } from "@/lib/data";
import { pageMetadata } from "@/lib/page-meta";

export function generateMetadata() {
  return pageMetadata("home", "/");
}

export default async function HomePage() {
  const page = await getPage("home");
  if (!page || page.status !== "PUBLISHED") notFound();
  return <Blocks sections={page.sections} />;
}
