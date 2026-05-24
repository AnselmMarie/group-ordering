import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getResend } from "@/server/email/resend-client";

import { sendEmail } from "./send-email";

vi.mock("@/server/email/resend-client", () => ({
  getResend: vi.fn(),
}));

const send = vi.fn();

const mockedGetResend = vi.mocked(getResend);

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetResend.mockReturnValue({ emails: { send } } as never);
  process.env.EMAIL_ADDRESS_NOTIFICATIONS = "notifications@example.com";
});

const Dummy = () => createElement("div", null, "hi");

describe("sendEmail", () => {
  it("forwards from, to, subject, and react element to Resend", async () => {
    send.mockResolvedValue({ data: { id: "msg_1" }, error: null });

    const result = await sendEmail({
      to: "guest@example.com",
      subject: "Hello",
      react: createElement(Dummy),
    });

    expect(result).toEqual({ ok: true });
    expect(send).toHaveBeenCalledTimes(1);
    const payload = send.mock.calls[0][0];
    expect(payload.from).toBe("notifications@example.com");
    expect(payload.to).toBe("guest@example.com");
    expect(payload.subject).toBe("Hello");
    expect(payload.react).toBeDefined();
  });

  it("returns ok:false and logs when EMAIL_ADDRESS_NOTIFICATIONS is unset", async () => {
    delete process.env.EMAIL_ADDRESS_NOTIFICATIONS;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await sendEmail({
      to: "guest@example.com",
      subject: "Hello",
      react: createElement(Dummy),
    });

    expect(result).toEqual({ ok: false });
    expect(send).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      "sendEmail - EMAIL_ADDRESS_NOTIFICATIONS is not set, skipping send",
    );

    errorSpy.mockRestore();
  });

  it("returns ok:false and logs when Resend reports an error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    send.mockResolvedValue({
      data: null,
      error: { message: "unverified sender" },
    });

    const result = await sendEmail({
      to: "guest@example.com",
      subject: "Hello",
      react: createElement(Dummy),
    });

    expect(result).toEqual({ ok: false });
    expect(errorSpy).toHaveBeenCalledWith(
      "sendEmail - resend error",
      expect.objectContaining({ message: "unverified sender" }),
    );

    errorSpy.mockRestore();
  });

  it("returns ok:false and logs when the SDK throws", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    send.mockRejectedValue(new Error("network down"));

    const result = await sendEmail({
      to: "guest@example.com",
      subject: "Hello",
      react: createElement(Dummy),
    });

    expect(result).toEqual({ ok: false });
    expect(errorSpy).toHaveBeenCalledWith(
      "sendEmail - transport error",
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });
});
