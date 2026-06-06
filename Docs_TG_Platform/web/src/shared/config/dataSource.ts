/** When true, domain state initializes from seed data instead of API. */
export const USE_SEED_DATA =
  process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_USE_SEED !== "0";
