import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  getAppUrl,
  getDatabaseUrl,
  getEmailNotificationsAddress,
  getResendApiKey,
} from "./env";

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("getDatabaseUrl", () => {
  it("returns the value when set", () => {
    process.env.DATABASE_URL = "postgres://localhost/db";
    expect(getDatabaseUrl()).toBe("postgres://localhost/db");
  });

  it("throws when unset", () => {
    delete process.env.DATABASE_URL;
    expect(() => getDatabaseUrl()).toThrow("DATABASE_URL is not set");
  });

  it("throws when empty", () => {
    process.env.DATABASE_URL = "";
    expect(() => getDatabaseUrl()).toThrow("DATABASE_URL is not set");
  });
});

describe("getResendApiKey", () => {
  it("returns the value when set", () => {
    process.env.RESEND_API_KEY = "re_test";
    expect(getResendApiKey()).toBe("re_test");
  });

  it("throws when unset", () => {
    delete process.env.RESEND_API_KEY;
    expect(() => getResendApiKey()).toThrow("RESEND_API_KEY is not set");
  });
});

describe("getEmailNotificationsAddress", () => {
  it("returns the value when set", () => {
    process.env.EMAIL_ADDRESS_NOTIFICATIONS = "notifications@example.com";
    expect(getEmailNotificationsAddress()).toBe("notifications@example.com");
  });

  it("returns undefined when unset", () => {
    delete process.env.EMAIL_ADDRESS_NOTIFICATIONS;
    expect(getEmailNotificationsAddress()).toBeUndefined();
  });

  it("returns undefined when empty", () => {
    process.env.EMAIL_ADDRESS_NOTIFICATIONS = "";
    expect(getEmailNotificationsAddress()).toBeUndefined();
  });
});

describe("getAppUrl", () => {
  it("returns the value when set", () => {
    process.env.APP_URL = "http://localhost:3000";
    expect(getAppUrl()).toBe("http://localhost:3000");
  });

  it("returns undefined when unset", () => {
    delete process.env.APP_URL;
    expect(getAppUrl()).toBeUndefined();
  });
});
