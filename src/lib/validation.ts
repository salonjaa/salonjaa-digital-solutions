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

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginPayload = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>;

export const setNewPasswordSchema = z.object({
  password: z.string().min(8, "At least 8 characters").max(72),
});

export type SetNewPasswordPayload = z.infer<typeof setNewPasswordSchema>;

const lineItemSchema = z.object({
  label: z.string().min(1).max(120),
  amount_paise: z.number().int().positive(),
});

// Razorpay's own minimum order amount is 100 paise (₹1).
export const createPaymentRequestSchema = z.object({
  clientId: z.string().uuid(),
  clientPlanId: z.string().uuid().optional(),
  description: z.string().min(1, "Description is required").max(200),
  lineItems: z.array(lineItemSchema).default([]),
  amountPaise: z.number().int().min(100, "Minimum amount is ₹1 (100 paise)"),
});

export type CreatePaymentRequestPayload = z.infer<typeof createPaymentRequestSchema>;

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export type VerifyPaymentPayload = z.infer<typeof verifyPaymentSchema>;

export const createClientSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(120),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().max(20).optional().or(z.literal("")),
  companyName: z.string().max(120).optional().or(z.literal("")),
  planKey: z.string().max(40).optional().or(z.literal("")),
  planName: z.string().max(120).optional().or(z.literal("")),
  planPricePaise: z.number().int().min(0).optional(),
});

export type CreateClientPayload = z.infer<typeof createClientSchema>;

export const notifyPaymentSchema = z.object({
  orderId: z.string().uuid(),
});

export type NotifyPaymentPayload = z.infer<typeof notifyPaymentSchema>;

export const updateClientSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(120),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().max(20).optional().or(z.literal("")),
  companyName: z.string().max(120).optional().or(z.literal("")),
});

export type UpdateClientPayload = z.infer<typeof updateClientSchema>;

export const deleteClientSchema = z.object({
  confirmName: z.string().min(1, "Type the client's name to confirm."),
});

export const assignPlanSchema = z.object({
  planKey: z.string().min(1, "Plan is required").max(40),
  planName: z.string().min(1).max(120),
  basePricePaise: z.number().int().min(0),
  notes: z.string().max(500).optional().or(z.literal("")),
  endCurrentPlan: z.boolean().default(true),
});

export type AssignPlanPayload = z.infer<typeof assignPlanSchema>;

export const updatePlanSchema = z.object({
  planId: z.string().uuid(),
  status: z.enum(["active", "paused", "ended"]),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type UpdatePlanPayload = z.infer<typeof updatePlanSchema>;

export const domainSchema = z.object({
  domainName: z.string().min(1, "Domain is required").max(255),
  registrar: z.string().max(120).optional().or(z.literal("")),
  status: z.enum(["registered", "dns_pending", "live", "expired"]),
  purchasedAt: z.string().max(10).optional().or(z.literal("")),
  renewalDate: z.string().max(10).optional().or(z.literal("")),
  autoRenew: z.boolean().default(false),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type DomainPayload = z.infer<typeof domainSchema>;

export const updateDomainSchema = domainSchema.extend({ domainId: z.string().uuid() });

export type UpdateDomainPayload = z.infer<typeof updateDomainSchema>;
