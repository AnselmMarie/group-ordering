import { Resend } from "resend";

import { getResendApiKey } from "@/lib/env";

let instance: Resend | null = null;

export const getResend = (): Resend => {
  if (!instance) {
    instance = new Resend(getResendApiKey());
  }
  return instance;
};
