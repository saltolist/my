export const DEMO_USER = {
  nick: "researcher",
  email: "demo@tgplatform.local",
} as const;

export type UserPasswordFlow = "idle" | "confirm-send" | "code" | "password";
