import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

export async function startMsw(): Promise<void> {
  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: process.env.NODE_ENV === "production",
  });
}
