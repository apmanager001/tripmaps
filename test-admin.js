const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/tripmaps"
);

// Import models
const User = require("./backend/model/user");
const Flag = require("./backend/model/flag");

async function testAdminFunctionality() {
  try {
    console.log("🧪 Testing Admin Functionality...\n");

    // 1. Check if admin user exists
    console.log("1. Checking for admin users...");
    const adminUsers = await User.find({ role: "admin" });
    console.log(`Found ${adminUsers.length} admin user(s)`);

    if (adminUsers.length === 0) {
      console.log("⚠️  No admin users found. Creating a test admin...");
      const testAdmin = await User.findOne({ email: "test@example.com" });
      if (testAdmin) {
        testAdmin.role = "admin";
        await testAdmin.save();
        console.log("✅ Test user promoted to admin");
      } else {
        console.log("❌ No test user found. Please create a user first.");
        return;
      }
    }

    // 2. Check flag data
    console.log("\n2. Checking flag data...");
    const totalFlags = await Flag.countDocuments();
    const pendingFlags = await Flag.countDocuments({ status: "pending" });
    const resolvedFlags = await Flag.countDocuments({ status: "resolved" });
    const dismissedFlags = await Flag.countDocuments({ status: "dismissed" });

    console.log(`Total flags: ${totalFlags}`);
    console.log(`Pending flags: ${pendingFlags}`);
    console.log(`Resolved flags: ${resolvedFlags}`);
    console.log(`Dismissed flags: ${dismissedFlags}`);

    // 3. Test flag with populated data
    console.log("\n3. Testing flag with populated data...");
    const sampleFlag = await Flag.findOne()
      .populate("photoId", "s3Url thumbnailUrl")
      .populate("flaggedBy", "username email")
      .populate("photoOwner", "username email")
      .populate("poiId", "locationName")
      .populate("mapId", "mapName")
      .populate("reviewedBy", "username");

    if (sampleFlag) {
      console.log("✅ Sample flag found with populated data");
      console.log(
        `   - Flagged by: ${sampleFlag.flaggedBy?.username || "Unknown"}`
      );
      console.log(
        `   - Photo owner: ${sampleFlag.photoOwner?.username || "Unknown"}`
      );
      console.log(`   - Status: ${sampleFlag.status}`);
      console.log(`   - Reason: ${sampleFlag.reason}`);
    } else {
      console.log("⚠️  No flags found in database");
    }

    // 4. Test admin middleware logic
    console.log("\n4. Testing admin middleware logic...");
    const testUser = await User.findOne({ role: "admin" });
    if (testUser) {
      console.log(
        `✅ Admin user found: ${testUser.username} (${testUser.email})`
      );
      console.log(`   - Role: ${testUser.role}`);
    } else {
      console.log("❌ No admin user found");
    }

    console.log("\n🎉 Admin functionality test completed!");
    console.log("\n📋 Next steps:");
    console.log("1. Start the backend server: cd backend && npm start");
    console.log("2. Start the frontend: npm run dev");
    console.log("3. Login as an admin user");
    console.log("4. Navigate to dashboard and check for Admin tab");
    console.log("5. Test flag management functionality");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testAdminFunctionality();
