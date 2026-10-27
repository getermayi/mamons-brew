import { MediaLibrary } from "@/components/admin/media-picker";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/session";

export default async function MediaPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Media library" description="Upload, crop and describe photos once — then pick them anywhere on the site. Click an image to edit its alt text or folder." />
      <MediaLibrary manage />
    </>
  );
}
