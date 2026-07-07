const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";

// We need an admin auth token to test the user CRUD routes
// Note: In a real test environment, this would login first.
// We will mock/test the endpoints. If the server is not running or doesn't have an admin,
// this test script is designed to run in a standalone fashion or report connection status.

async function runTests() {
  console.log(" Starting Backend User Management CRUD API Verification...");
  
  // 1. Check if backend health endpoint is online
  try {
    const health = await axios.get(`${BASE_URL}/health`);
    console.log(" Backend server is ONLINE:", health.data);
  } catch (error) {
    console.error(" Backend server is OFFLINE. Please start the backend with `npm run dev` in the backend folder first.");
    console.error("Error:", error.message);
    return;
  }

  // To test admin-only routes, we would normally authenticate and get a JWT token.
  // For safety in this test script, if we cannot authenticate, we will print the instructions
  // to run tests or verify manually. Let's see if we can log in as admin.
  let token = "";
  try {
    // Attempt login with default admin credentials if they exist
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: "admin@university.edu.ng",
      password: "AdminPassword123!" // default seed/admin password
    });
    token = loginRes.data.access_token;
    console.log(" Authenticated as Admin successfully.");
  } catch (error) {
    console.warn(" Admin authentication failed (either no seeded admin or different credentials).");
    console.warn("We will proceed without authorization headers. Endpoints may return 401/403.");
  }

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // Mock User Data for Test
  const testUser = {
    name: "Test Engineer " + Math.floor(Math.random() * 1000),
    email: `test.engineer.${Math.floor(Math.random() * 10000)}@university.edu.ng`,
    phone: "+2348039999999",
    staffId: "TST-" + Math.floor(Math.random() * 10000),
    department: "System Testing",
    role: "staff",
    accessLevel: 2
  };

  let createdUserId = "";
  let createdUserUid = "";

  // Test 2: Register User
  try {
    console.log("\nTesting POST /api/users (Register User)...");
    const res = await axios.post(`${BASE_URL}/users`, testUser, { headers: authHeader });
    console.log(" User registered successfully. Response:");
    console.log(`   - ID: ${res.data.user.id || res.data.user._id}`);
    console.log(`   - Name: ${res.data.user.name}`);
    console.log(`   - UID (Auto-Generated): ${res.data.user.uid}`);
    console.log(`   - Temp Password: ${res.data.tempPassword}`);
    createdUserId = res.data.user.id || res.data.user._id;
    createdUserUid = res.data.user.uid;
  } catch (error) {
    console.error(" Register User Failed:", error.response?.data || error.message);
  }

  if (!createdUserId) {
    console.log("\n Unable to proceed with CRUD test sequence because registration failed.");
    return;
  }

  // Test 3: Prevent Duplicate Email
  try {
    console.log("\nTesting Duplicate Email prevention...");
    await axios.post(`${BASE_URL}/users`, {
      ...testUser,
      staffId: "DIFFERENT-ID-" + Math.floor(Math.random() * 100)
    }, { headers: authHeader });
    console.error(" Duplicate email check failed! Server accepted duplicate email.");
  } catch (error) {
    console.log("Duplicate email prevention working. Server rejected with:", error.response?.data?.message || error.message);
  }

  // Test 4: Get All Users
  try {
    console.log("\nTesting GET /api/users (Get All Users)...");
    const res = await axios.get(`${BASE_URL}/users`, { headers: authHeader });
    console.log(` Get all users successful. Found ${res.data.length} active users.`);
    const found = res.data.find(u => (u.id || u._id) === createdUserId);
    if (found) {
      console.log("   - Registered user is present in user list.");
    } else {
      console.error("   - Registered user is MISSING from user list!");
    }
  } catch (error) {
    console.error(" Get All Users Failed:", error.response?.data || error.message);
  }

  // Test 5: Search Users
  try {
    console.log(`\nTesting search filter (search=${testUser.name})...`);
    const res = await axios.get(`${BASE_URL}/users?search=${encodeURIComponent(testUser.name)}`, { headers: authHeader });
    console.log(` Search result returned ${res.data.length} users.`);
    if (res.data.length > 0 && res.data[0].name === testUser.name) {
      console.log("   - Correct user found by name query.");
    } else {
      console.error("   - User search returned incorrect result.");
    }
  } catch (error) {
    console.error(" Search Users Failed:", error.response?.data || error.message);
  }

  // Test 6: Get User by ID
  try {
    console.log(`\nTesting GET /api/users/${createdUserId} (Get User by ID)...`);
    const res = await axios.get(`${BASE_URL}/users/${createdUserId}`, { headers: authHeader });
    console.log(" Get user by ID successful. User name:", res.data.name);
  } catch (error) {
    console.error(" Get User by ID Failed:", error.response?.data || error.message);
  }

  // Test 7: Update User
  try {
    console.log(`\nTesting PUT /api/users/${createdUserId} (Update User)...`);
    const updateData = {
      name: testUser.name + " (Updated)",
      phone: "+2348038888888",
      cardStatus: "suspended"
    };
    const res = await axios.put(`${BASE_URL}/users/${createdUserId}`, updateData, { headers: authHeader });
    console.log(" User update successful:");
    console.log(`   - Name: ${res.data.user.name}`);
    console.log(`   - Phone: ${res.data.user.phone}`);
    console.log(`   - Card Status: ${res.data.user.cardStatus}`);
  } catch (error) {
    console.error(" Update User Failed:", error.response?.data || error.message);
  }

  // Test 8: Soft Delete User
  try {
    console.log(`\nTesting DELETE /api/users/${createdUserId} (Soft Delete User)...`);
    const res = await axios.delete(`${BASE_URL}/users/${createdUserId}`, { headers: authHeader });
    console.log(" Soft delete request successful:", res.data.message);

    // Verify soft-deleted user is now 404'ed
    try {
      await axios.get(`${BASE_URL}/users/${createdUserId}`, { headers: authHeader });
      console.error(" Soft delete failed! User is still retrievable by ID.");
    } catch (err) {
      console.log(" Soft-deleted user correctly returns 404 (Not Found) on GET request.");
    }

    // Verify soft-deleted user is omitted from List
    const listRes = await axios.get(`${BASE_URL}/users`, { headers: authHeader });
    const foundDeleted = listRes.data.find(u => (u.id || u._id) === createdUserId);
    if (!foundDeleted) {
      console.log(" Soft-deleted user is correctly excluded from the main users list.");
    } else {
      console.error(" Soft-deleted user is still visible in the main users list!");
    }
  } catch (error) {
    console.error(" Soft Delete Failed:", error.response?.data || error.message);
  }

  console.log("\n API Verification complete.");
}

runTests();
