import { z } from "zod";

import { emailSchema } from "@/lib/zod-validators";

export const createInvitationSchema = z.object({
  email: emailSchema,
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
