import { setupWorker } from "msw/browser";
import { BASE_PATH } from "@/shared/config/basePath";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

export async function startMsw(): Promise<void> {
  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: process.env.NODE_ENV === "production",
    serviceWorker: {
      url: `${BASE_PATH}/mockServiceWorker.js`,
      options: {
        scope: BASE_PATH ? `${BASE_PATH}/` : "/",
      },
    },
  });
}
