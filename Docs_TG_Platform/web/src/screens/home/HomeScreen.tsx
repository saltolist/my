"use client";

import { useRouter } from "next/navigation";

import { routes } from "@/shared/lib/routes";
import { PageHeader } from "@/widgets/page-header";

export function HomeScreen() {
  const router = useRouter();

  return (
    <>
      <PageHeader
        left={
          <button
            className="page-header-home-brand"
            type="button"
            onClick={() => router.push(routes.home())}
          >
            TG Platform
          </button>
        }
      />
      <div className="home-layout">
        <div className="home-intro">
          <div className="home-logo">✦</div>
          <h3>Чем помочь сегодня?</h3>
        </div>
        <div className="input-wrap home-composer-placeholder">
          <div className="input-box">
            <p className="home-composer-placeholder-text">
              Composer появится на следующем шаге (M3).
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
