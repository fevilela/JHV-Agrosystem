import { describe, it, expect, afterEach } from "vitest";
import { getPlatformEmailCredentials } from "./email";

describe("getPlatformEmailCredentials", () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalFromEmail = process.env.RESEND_FROM_EMAIL;

  afterEach(() => {
    process.env.RESEND_API_KEY = originalApiKey;
    process.env.RESEND_FROM_EMAIL = originalFromEmail;
  });

  it("reads credentials straight from RESEND_API_KEY/RESEND_FROM_EMAIL, not the database", () => {
    process.env.RESEND_API_KEY = "re_test_123";
    process.env.RESEND_FROM_EMAIL = "sistema@jhvagrosystem.com.br";

    expect(getPlatformEmailCredentials()).toEqual({
      apiKey: "re_test_123",
      fromEmail: "sistema@jhvagrosystem.com.br",
    });
  });

  it("returns undefined for whichever env var isn't set, so callers fall back to skipped", () => {
    delete process.env.RESEND_API_KEY;
    process.env.RESEND_FROM_EMAIL = "sistema@jhvagrosystem.com.br";
    expect(getPlatformEmailCredentials()).toEqual({
      apiKey: undefined,
      fromEmail: "sistema@jhvagrosystem.com.br",
    });

    process.env.RESEND_API_KEY = "re_test_123";
    delete process.env.RESEND_FROM_EMAIL;
    expect(getPlatformEmailCredentials()).toEqual({
      apiKey: "re_test_123",
      fromEmail: undefined,
    });
  });
});
