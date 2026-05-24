import { Resend } from "resend";

let instance: Resend | null = null;

export const getResend = (): Resend => {
  if (!instance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }
    instance = new Resend(apiKey);
  }
  return instance;
};
