import { Suspense } from "react";
import { LegacyRouteRedirect } from "./LegacyRouteRedirect";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Suspense fallback={null}>
        <LegacyRouteRedirect />
      </Suspense>
      {children}
    </div>
  );
}
