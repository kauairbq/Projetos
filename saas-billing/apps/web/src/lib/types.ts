export type BillingInterval = "MONTHLY" | "YEARLY";
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING";
export type InvoiceStatus = "DRAFT" | "OPEN" | "PAID" | "VOID";

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  priceCents: number;
  interval: BillingInterval;
  active: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string | null;
  plan?: Plan;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  amountCents: number;
  currency: string;
  status: InvoiceStatus;
  issuedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  role: "USER" | "ADMIN";
}
