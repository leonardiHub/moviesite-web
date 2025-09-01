const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function updateAdminPassword() {
  try {
    console.log("🔍 Updating admin password to 'admin'...");

    // Hash the new password "admin"
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash("admin", saltRounds);

    // Update the admin user password
    const updatedAdmin = await prisma.adminUser.update({
      where: { username: "admin" },
      data: { passwordHash: newPasswordHash },
    });

    console.log("✅ Admin password updated successfully!");
    console.log("Username:", updatedAdmin.username);
    console.log("Email:", updatedAdmin.email);
    console.log("New password: admin");

    // Test the login
    console.log("\n🔍 Testing login with new password...");
    const testPassword = "admin";
    const isValid = await bcrypt.compare(testPassword, updatedAdmin.passwordHash);
    console.log("✅ Password validation test:", isValid ? "PASSED" : "FAILED");

  } catch (error) {
    console.error("❌ Error updating admin password:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();
