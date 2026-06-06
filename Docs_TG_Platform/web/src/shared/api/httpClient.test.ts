import { describe, expect, it, vi, afterEach } from "vitest";

describe("apiRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("throws when API base URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    vi.resetModules();
    const { apiRequest: req } = await import("./httpClient");
    await expect(req("/test")).rejects.toThrow("NEXT_PUBLIC_API_BASE_URL");
  });

  it("parses JSON response", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://api.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{ id: 1 }]),
      }),
    );
    vi.resetModules();
    const { apiRequest: req } = await import("./httpClient");
    await expect(req("/posts")).resolves.toEqual([{ id: 1 }]);
  });
});
