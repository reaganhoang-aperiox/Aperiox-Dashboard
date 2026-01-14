import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(express.json());

// Test route
app.get("/test", (req, res) => {
  res.json({
    status: "Server is working!",
    message: "MT4 API Test Server",
    env: {
      PORT: process.env.PORT || "not set",
      JWT_SECRET: process.env.JWT_SECRET ? "✅ Set" : "❌ Not set",
      METAAPI_TOKEN: process.env.METAAPI_TOKEN ? "✅ Set" : "❌ Not set",
      FRONTEND_URL: process.env.FRONTEND_URL || "not set",
    },
  });
});

// Mock login for testing
app.post("/test/login", (req, res) => {
  const { username, password } = req.body;

  res.json({
    success: true,
    message: "Test login successful",
    data: { username, password: "***" },
  });
});

// Testing

app.listen(PORT, () => {
  console.log(`\n🧪 Test server running on http://localhost:${PORT}`);
  console.log(`\n📝 Try: curl http://localhost:${PORT}/test`);
  console.log(`\n⚙️  Environment check:\n`);
  console.log(`   PORT: ${process.env.PORT || "❌ Not set (using default)"}`);
  console.log(
    `   JWT_SECRET: ${process.env.JWT_SECRET ? "✅ Set" : "❌ Not set"}`
  );
  console.log(
    `   METAAPI_TOKEN: ${process.env.METAAPI_TOKEN ? "✅ Set" : "❌ Not set"}`
  );
  console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || "❌ Not set"}\n`);
});
