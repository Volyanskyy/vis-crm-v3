import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserStatus, CatalogStatus } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });



async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "vis-montag" },
    update: {},
    create: {
      name: "VIS Montag",
      slug: "vis-montag",
      legalName: "VIS Montag",
      email: "admin@vis-montag.local",
      phone: "+380000000000",
      timezone: "Europe/Kyiv",
      currency: "UAH",
      isActive: true,
    },
  });

  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { code: "system.full_access" },
      update: {},
      create: {
        code: "system.full_access",
        name: "System full access",
        description: "Full access to all system features",
      },
    }),
    prisma.permission.upsert({
      where: { code: "projects.manage" },
      update: {},
      create: {
        code: "projects.manage",
        name: "Manage projects",
        description: "Create and manage projects",
      },
    }),
    prisma.permission.upsert({
      where: { code: "estimates.manage" },
      update: {},
      create: {
        code: "estimates.manage",
        name: "Manage estimates",
        description: "Create and manage estimates",
      },
    }),
    prisma.permission.upsert({
      where: { code: "catalogs.manage" },
      update: {},
      create: {
        code: "catalogs.manage",
        name: "Manage catalogs",
        description: "Manage work prices and materials catalogs",
      },
    }),
    prisma.permission.upsert({
      where: { code: "field_reports.manage" },
      update: {},
      create: {
        code: "field_reports.manage",
        name: "Manage field reports",
        description: "Create and review field reports",
      },
    }),
  ]);

  const adminRole = await prisma.role.upsert({
    where: { code: "admin" },
    update: {},
    create: {
      code: "admin",
      name: "Administrator",
      description: "System administrator",
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { code: "manager" },
    update: {},
    create: {
      code: "manager",
      name: "Manager",
      description: "Project manager",
    },
  });

  const workerRole = await prisma.role.upsert({
    where: { code: "worker" },
    update: {},
    create: {
      code: "worker",
      name: "Worker",
      description: "Field worker",
    },
  });

  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  const managerPermissions = permissions.filter((p) =>
    ["projects.manage", "estimates.manage", "field_reports.manage"].includes(p.code)
  );

  for (const permission of managerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: managerRole.id,
        permissionId: permission.id,
      },
    });
  }

  const adminUser = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: "admin@vis-montag.local",
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "admin@vis-montag.local",
      firstName: "Volodymyr",
      lastName: "Volyanskyy",
      fullName: "Volodymyr Volyanskyy",
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  await prisma.employeeProfile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: adminUser.id,
      employeeCode: "EMP-001",
      positionTitle: "Owner / Administrator",
      isResponsible: true,
      skillsSummary: "Management, electrical systems, project supervision",
    },
  });

  await prisma.workPriceList.upsert({
    where: { id: "seed-work-price-list-electro" },
    update: {},
    create: {
      id: "seed-work-price-list-electro",
      tenantId: tenant.id,
      code: "WPL-ELECTRO-001",
      name: "Електромонтажні роботи — базовий",
      category: "electrical",
      description: "Стартовий прайс для MVP",
      version: 1,
      status: CatalogStatus.ACTIVE,
      isCurrent: true,
    },
  });

  await prisma.materialCatalog.upsert({
    where: { id: "seed-material-catalog-main" },
    update: {},
    create: {
      id: "seed-material-catalog-main",
      tenantId: tenant.id,
      code: "MAT-MAIN-001",
      name: "Основні матеріали",
      category: "electrical",
      description: "Стартовий каталог матеріалів для MVP",
      version: 1,
      status: CatalogStatus.ACTIVE,
      isCurrent: true,
    },
  });

  console.log("Seed completed successfully");
  console.log({
    tenantId: tenant.id,
    adminUserId: adminUser.id,
    roles: [adminRole.code, managerRole.code, workerRole.code],
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
