process.env.PRISMA_CLIENT_ENGINE_TYPE = "library";
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient({});

async function main() {
  const passwordHash = await bcrypt.hash("03101812@", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@saas.local" },
    update: {},
    create: {
      email: "admin@saas.local",
      name: "Admin SaaS",
      role: "ADMIN",
      passwordHash,
    },
  });

  const organization = await prisma.organization.upsert({
    where: { slug: "saas-demo" },
    update: {},
    create: {
      name: "SaaS Demo Org",
      slug: "saas-demo",
    },
  });

  await prisma.organizationUser.upsert({
    where: { userId_organizationId: { userId: admin.id, organizationId: organization.id } },
    update: {},
    create: {
      userId: admin.id,
      organizationId: organization.id,
      role: "OWNER",
    },
  });

  const starter = await prisma.plan.upsert({
    where: { id: "starter-plan" },
    update: {},
    create: {
      id: "starter-plan",
      name: "Starter",
      description: "Ideal para equipas pequenas",
      priceCents: 2900,
      interval: "MONTHLY",
      active: true,
      maxUsers: 1,
      canExport: false,
      advancedReports: false,
    },
  });

  const scale = await prisma.plan.upsert({
    where: { id: "scale-plan" },
    update: {},
    create: {
      id: "scale-plan",
      name: "Scale",
      description: "Para crescimento com automações",
      priceCents: 9900,
      interval: "MONTHLY",
      active: true,
      maxUsers: 5,
      canExport: true,
      advancedReports: true,
    },
  });

  const enterprise = await prisma.plan.upsert({
    where: { id: "enterprise-plan" },
    update: {},
    create: {
      id: "enterprise-plan",
      name: "Enterprise",
      description: "Contas enterprise com SLA dedicado",
      priceCents: 24900,
      interval: "MONTHLY",
      active: true,
      maxUsers: 999,
      canExport: true,
      advancedReports: true,
    },
  });

  const subscription = await prisma.subscription.upsert({
    where: { id: "admin-subscription" },
    update: {},
    create: {
      id: "admin-subscription",
      organizationId: organization.id,
      planId: starter.id,
      status: "ACTIVE",
    },
  });

  const invoice = await prisma.invoice.upsert({
    where: { id: "invoice-001" },
    update: {},
    create: {
      id: "invoice-001",
      organizationId: organization.id,
      subscriptionId: subscription.id,
      amountCents: starter.priceCents,
      currency: "EUR",
      status: "PAID",
    },
  });

  await prisma.payment.upsert({
    where: { id: "payment-001" },
    update: {},
    create: {
      id: "payment-001",
      invoiceId: invoice.id,
      amountCents: invoice.amountCents,
      currency: "EUR",
      status: "SUCCEEDED",
      provider: "manual",
    },
  });

  console.log("Seed concluído:", {
    admin: admin.email,
    organization: organization.name,
    plans: [starter.name, scale.name, enterprise.name],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
