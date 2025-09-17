const fetch = require("node-fetch");

async function testTopUsers() {
  try {
    const response = await fetch("http://localhost:3001/users/top?limit=10", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

testTopUsers();
