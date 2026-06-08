import { notFound } from "next/navigation";

import { UiGallery } from "./UiGallery";

export default function UiGalleryPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <UiGallery />;
}
