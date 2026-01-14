import bcrypt from "bcryptjs";

/**
 * Utility to generate bcrypt password hash
 * Usage: node utils/generateHash.js yourpassword
 */

const password = process.argv[2];

if (!password) {
  console.error("❌ Please provide a password");
  console.log("Usage: node utils/generateHash.js yourpassword");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
console.log("\n✅ Password Hash Generated:\n");
console.log(hash);
console.log("\n📝 Add this to your investors array in routes/auth.js\n");
