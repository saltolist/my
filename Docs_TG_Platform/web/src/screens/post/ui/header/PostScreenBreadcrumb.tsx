"use client";

import { Breadcrumb } from "@/shared/ui/breadcrumb";
import { buildPostBreadcrumbTrail, type PostBreadcrumbTrailContext } from "@/shared/lib/nav/breadcrumbTrails";

type Props = PostBreadcrumbTrailContext;

export default function PostScreenBreadcrumb(props: Props) {
  return <Breadcrumb items={buildPostBreadcrumbTrail(props)} />;
}
