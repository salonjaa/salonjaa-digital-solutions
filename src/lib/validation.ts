import { z } from "zod";

/**
 * `company` is a honeypot field: it's visually hidden in the form, so a
 * real visitor never fills it. Any non-empty value marks the submission
 * as a bot. The route handler responds with a fake success in that case so
 * bots aren't tipped off that they were caught.
 */
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  phone: z.string().max(30).optional().or(z.literal("")),
  projectType: z.string().max(80).optional().or(z.literal("")),
  message: z.string().min(1, "Message is required").max(2000),
  company: z.string().max(0).optional().or(z.literal("")),
});

export type ContactPayload = z.infer<typeof contactSchema>;
