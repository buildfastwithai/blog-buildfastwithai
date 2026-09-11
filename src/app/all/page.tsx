import { Metadata } from "next";
import { generateAllBlogsMetadata } from "@/utils/seo/metadata";
import ArchiveView from "../_components/(all-blogs)/archive-view";

export function generateMetadata(): Metadata {
  return generateAllBlogsMetadata({});
}

export const revalidate = 3600;

export default async function AllBlogsPage() {
  return <ArchiveView page={1} />;
}
