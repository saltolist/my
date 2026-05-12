"use client";

import { useApp } from "@/state/AppContext";
import Composer from "../composer/Composer";

export default function HomeScreen() {
  const { sendHome } = useApp();
  return (
    <div className="home-layout">
      <div className="home-intro">
        <div className="home-logo">✦</div>
        <h3>Чем помочь сегодня?</h3>
      </div>
      <Composer scope="home" onSubmit={sendHome} />
    </div>
  );
}
