"use client";

import { useComposer } from "@/state/composer-store";
import { useNavigation } from "@/state/navigation-store";
import Composer from "../composer/Composer";
import PageHeader from "../PageHeader";

export default function HomeScreen() {
  const { sendHome } = useComposer();
  const { goHome } = useNavigation();
  return (
    <>
      <PageHeader
        left={
          <button className="page-header-home-brand" type="button" onClick={goHome}>
            TG Platform
          </button>
        }
      />
      <div className="home-layout">
      <div className="home-intro">
        <div className="home-logo">✦</div>
        <h3>Чем помочь сегодня?</h3>
      </div>
      <Composer scope="home" onSubmit={sendHome} />
      </div>
    </>
  );
}
