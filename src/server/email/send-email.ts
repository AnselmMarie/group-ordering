import type { ReactElement } from "react";

import { getEmailNotificationsAddress } from "@/lib/env";
import { getResend } from "@/server/email/resend-client";

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
  const from = getEmailNotificationsAddress();
  if (!from) {
    console.error(
      "sendEmail - EMAIL_ADDRESS_NOTIFICATIONS is not set, skipping send",
    );
    return { ok: false };
  }

  try {
    const response = await getResend().emails.send({
      from,
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
