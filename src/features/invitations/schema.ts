import { z } from "zod";

import { emailSchema } from "@/lib/zod-validators";

export const createInvitationSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  email: emailSchema,
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
