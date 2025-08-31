const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function debugLogin() {
  try {
    console.log("🔍 Testing database connection...");

    // Test 1: Check if we can connect to the database
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Test 2: Check if admin user exists
    console.log("\n🔍 Checking admin user...");
    const adminUser = await prisma.adminUser.findUnique({
      where: { username: "admin" },
    });

    if (adminUser) {
      console.log("✅ Admin user found:", {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        name: adminUser.name,
      });
    } else {
      console.log("❌ Admin user not found");
      return;
    }

    // Test 3: Check password hash
    console.log("\n🔍 Testing password validation...");
    const password = "admin";
    const isValid = await bcrypt.compare(password, adminUser.passwordHash);
    console.log("✅ Password validation:", isValid);

    // Test 4: Check user roles
    console.log("\n🔍 Checking user roles...");
    const userWithRoles = await prisma.adminUser.findUnique({
      where: { username: "admin" },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (userWithRoles) {
      console.log("✅ User with roles found");
      console.log(
        "Roles:",
        userWithRoles.roles.map((r) => r.role.name)
      );
      console.log(
        "Permissions:",
        userWithRoles.roles.flatMap((r) =>
          r.role.permissions.map((rp) => rp.permission.code)
        )
      );
    } else {
      console.log("❌ Failed to load user with roles");
    }
  } catch (error) {
    console.error("❌ Error during debug:", error);
    console.error("Stack trace:", error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin();
