INSERT INTO "User" (id, email, name, "passwordHash", role, "createdAt", "updatedAt")
VALUES ('af061702-cc7e-4b93-8eff-a4f3cd286aa5','admin@saas.local','Admin SaaS','.gAUlFTlI.AVJw08yGoiudJ/hqDYM46AUpczNTtqm','ADMIN', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO "Organization" (id, name, slug, "createdAt", "updatedAt")
VALUES ('3e8c3113-e102-48b0-8d85-094d81e9cbd3','SaaS Demo Org','saas-demo', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "OrganizationUser" (id, "userId", "organizationId", role, "createdAt")
VALUES (
  'b3002c32-5e45-4351-bcfd-d3e5301f05af',
  (SELECT id FROM "User" WHERE email='admin@saas.local'),
  (SELECT id FROM "Organization" WHERE slug='saas-demo'),
  'OWNER',
  NOW()
)
ON CONFLICT ("userId", "organizationId") DO NOTHING;

INSERT INTO "Plan" (id, name, description, "priceCents", interval, active, "maxUsers", "canExport", "advancedReports", "createdAt", "updatedAt")
VALUES
  ('starter-plan','Starter','Ideal para equipas pequenas',2900,'MONTHLY',true,1,false,false, NOW(), NOW()),
  ('scale-plan','Scale','Para crescimento com automações',9900,'MONTHLY',true,5,true,true, NOW(), NOW()),
  ('enterprise-plan','Enterprise','Contas enterprise com SLA dedicado',24900,'MONTHLY',true,999,true,true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Subscription" (id, "organizationId", "planId", status, "startDate", "createdAt", "updatedAt")
VALUES (
  'b8599f7e-2f7f-4cd7-81ce-1278cd226a31',
  (SELECT id FROM "Organization" WHERE slug='saas-demo'),
  'starter-plan',
  'ACTIVE',
  NOW(), NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Invoice" (id, "organizationId", "subscriptionId", "amountCents", currency, status, "issuedAt")
VALUES (
  '7888a34a-d414-45a1-bbc5-79ef6e0b883c',
  (SELECT id FROM "Organization" WHERE slug='saas-demo'),
  'b8599f7e-2f7f-4cd7-81ce-1278cd226a31',
  2900,
  'EUR',
  'PAID',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Payment" (id, "invoiceId", "amountCents", currency, status, provider, "createdAt")
VALUES (
  '075778b3-d32a-4cb1-9a81-ce8c68ed52b7',
  '7888a34a-d414-45a1-bbc5-79ef6e0b883c',
  2900,
  'EUR',
  'SUCCEEDED',
  'manual',
  NOW()
)
ON CONFLICT (id) DO NOTHING;
