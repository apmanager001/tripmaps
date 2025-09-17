const axios = require("axios");

const BASE_URL = "http://localhost:5000";

// Test admin email functionality
async function testAdminEmail() {
  try {
    console.log("🧪 Testing Admin Email Functionality...\n");

    // 1. Test admin login (you'll need to create an admin user first)
    console.log("1. Testing admin authentication...");

    // Replace with actual admin credentials
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: "admin@example.com", // Replace with actual admin email
      password: "adminpassword", // Replace with actual admin password
    });

    if (loginResponse.data.success) {
      console.log("✅ Admin login successful");

      // Get cookies for authenticated requests
      const cookies = loginResponse.headers["set-cookie"];

      // 2. Test getting user stats
      console.log("\n2. Testing user stats endpoint...");
      try {
        const statsResponse = await axios.get(`${BASE_URL}/admin/users/stats`, {
          headers: {
            Cookie: cookies.join("; "),
          },
        });

        if (statsResponse.data.success) {
          console.log("✅ User stats retrieved successfully");
          console.log("   Total users:", statsResponse.data.data.totalUsers);
          console.log(
            "   Verified users:",
            statsResponse.data.data.verifiedUsers
          );
          console.log("   Admin users:", statsResponse.data.data.adminUsers);
        }
      } catch (error) {
        console.log(
          "❌ Failed to get user stats:",
          error.response?.data?.message || error.message
        );
      }

      // 3. Test sending email to all users
      console.log("\n3. Testing email broadcast endpoint...");
      try {
        const emailResponse = await axios.post(
          `${BASE_URL}/admin/send-email`,
          {
            subject: "Test Admin Broadcast",
            markdownContent: `# Test Email

This is a **test email** from the admin panel.

## Features:
- Markdown support
- HTML rendering
- User targeting

[Visit our site](https://mytripmaps.com)`,
          },
          {
            headers: {
              Cookie: cookies.join("; "),
              "Content-Type": "application/json",
            },
          }
        );

        if (emailResponse.data.success) {
          console.log("✅ Email broadcast successful");
          console.log(
            "   Sent to:",
            emailResponse.data.data.successful,
            "users"
          );
          console.log("   Failed:", emailResponse.data.data.failed, "users");
        }
      } catch (error) {
        console.log(
          "❌ Failed to send email broadcast:",
          error.response?.data?.message || error.message
        );
      }
    } else {
      console.log("❌ Admin login failed:", loginResponse.data.message);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Instructions for setting up admin user
console.log("📋 Setup Instructions:");
console.log("1. Make sure your backend server is running on port 5000");
console.log("2. Create an admin user in your database:");
console.log("   - Use MongoDB shell or Compass");
console.log('   - Find a user and update their role to "admin"');
console.log(
  '   - Example: db.users.updateOne({email: "your-email@example.com"}, {$set: {role: "admin"}})'
);
console.log("3. Update the email and password in this test file");
console.log("4. Run: node test-admin-email.js\n");

// Run the test
testAdminEmail();







