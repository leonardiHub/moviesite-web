const fetch = require("node-fetch");

async function testEndpoint() {
  try {
    console.log("🧪 Testing Admin Movies Endpoint...\n");

    // Login to get admin token
    console.log("🔐 Logging in...");
    const loginResponse = await fetch("http://localhost:4000/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "admin",
        password: "admin123",
      }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log(`❌ Login failed: ${loginResponse.status} - ${errorText}`);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    console.log("✅ Login successful\n");

    // Test the endpoint
    console.log("📋 Testing admin movies endpoint...");
    const response = await fetch(
      "http://localhost:4000/v1/admin/movies?page=1&limit=5",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success! Found ${data.total} movies, showing ${data.data.length}`);
      console.log("Sample movie:", data.data[0]?.title || "No movies found");
    } else {
      const errorText = await response.text();
      console.log(`❌ Request failed: ${response.status} - ${errorText}`);
    }

  } catch (error) {
    console.error("❌ Error during testing:", error.message);
  }
}

// Run the test
testEndpoint();
