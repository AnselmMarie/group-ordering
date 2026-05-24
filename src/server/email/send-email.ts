import type { ReactElement } from "react";

import { getResend } from "@/server/email/resend-client";

const FROM_ADDRESS = "onboarding@resend.dev";

interface SendEmailProps {
  to: string;
  subject: string;
  react: ReactElement;
}

interface SendEmailResult {
  ok: boolean;
}

export const sendEmail = async ({
  to,
  subject,
  react,
}: SendEmailProps): Promise<SendEmailResult> => {
  try {
    const response = await getResend().emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      react,
    });

    if (response.error) {
      console.error("sendEmail - resend error", response.error);
      return { ok: false };
    }

    return { ok: true };
  } catch (err) {
    console.error("sendEmail - transport error", err);
    return { ok: false };
  }
};
