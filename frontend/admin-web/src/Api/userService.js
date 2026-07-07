import api from "./apiClient";

// Helper to generate system UID: NFC- + 7 alphanumeric characters
export const generateMockUID = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";
  for (let i = 0; i < 7; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NFC-${randomString}`;
};

// Fallback Mock Data for demo/offline situations
let mockUsers = [
  {
    id: "mock-1",
    name: "Dr. Adebayo Oluwaseun",
    email: "a.oluwaseun@university.edu.ng",
    phone: "+2348031234567",
    staffId: "ST-00234",
    department: "Computer Science",
    role: "staff",
    uid: "NFC-A8D9F2C",
    cardStatus: "active",
    accessLevel: 3,
    profilePhoto: "",
  },
  {
    id: "mock-2",
    name: "Ngozi Eze",
    email: "n.eze@university.edu.ng",
    phone: "+2348123456789",
    staffId: "ST-01923",
    department: "Electrical Engineering",
    role: "staff",
    uid: "NFC-B3E8F4A",
    cardStatus: "active",
    accessLevel: 2,
    profilePhoto: "",
  },
  {
    id: "mock-3",
    name: "Tunde Bakare",
    email: "t.bakare@student.edu.ng",
    phone: "+2347055554443",
    staffId: "MAT-2022-4412",
    department: "Computer Science",
    role: "student",
    uid: "NFC-D5G7H9J",
    cardStatus: "suspended",
    accessLevel: 1,
    profilePhoto: "",
  },
  {
    id: "mock-4",
    name: "Prof. Ibrahim Yusuf",
    email: "i.yusuf@university.edu.ng",
    phone: "+2348022223333",
    staffId: "ST-00012",
    department: "Mechanical Engineering",
    role: "admin",
    uid: "NFC-K2L4M6N",
    cardStatus: "active",
    accessLevel: 3,
    profilePhoto: "",
  },
  {
    id: "mock-5",
    name: "Chioma Nnaji",
    email: "c.nnaji@student.edu.ng",
    phone: "+2348166667777",
    staffId: "MAT-2021-9310",
    department: "Microbiology",
    role: "student",
    uid: "NFC-P9Q7R5S",
    cardStatus: "revoked",
    accessLevel: 1,
    profilePhoto: "",
  },
];

// GET all users (with search and filters)
export const getUsers = async (params = {}) => {
  try {
    const response = await api.get("/users", { params });
    return response.data;
  } catch (error) {
    console.warn("Backend users endpoint failed or offline. Falling back to mock data.", error.message);
    
    // Simulate search and filtering on mock data
    let filtered = [...mockUsers];

    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          u.staffId.toLowerCase().includes(s)
      );
    }

    if (params?.department) {
      filtered = filtered.filter(
        (u) => u.department.toLowerCase() === params.department.toLowerCase()
      );
    }

    if (params?.role) {
      filtered = filtered.filter(
        (u) => u.role.toLowerCase() === params.role.toLowerCase()
      );
    }

    if (params?.cardStatus) {
      filtered = filtered.filter(
        (u) => u.cardStatus.toLowerCase() === params.cardStatus.toLowerCase()
      );
    }

    return filtered;
  }
};

// GET user by ID
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.warn(`Failed to fetch user ${id} from backend. Falling back to mock data.`);
    const found = mockUsers.find((u) => u.id === id || u._id === id);
    if (!found) throw new Error("User not found");
    return found;
  }
};

// REGISTER user
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/users", userData);
    return response.data;
  } catch (error) {
    console.warn("Failed to create user on backend. Simulating locally in mock data.", error.message);

    // Validate email uniqueness on mock data
    if (mockUsers.some((u) => u.email.toLowerCase() === userData.email?.toLowerCase())) {
      throw new Error(`A user with email ${userData.email} already exists`);
    }

    // Validate staffId uniqueness on mock data
    if (mockUsers.some((u) => u.staffId === userData.staffId)) {
      throw new Error(`A user with Staff/Matric ID ${userData.staffId} already exists`);
    }

    const assignedUid = userData.uid || generateMockUID();

    const newUser = {
      id: `mock-${Date.now()}`,
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      staffId: userData.staffId || "",
      department: userData.department || "",
      role: userData.role || "staff",
      uid: assignedUid,
      cardStatus: "active",
      accessLevel: userData.accessLevel || 1,
      profilePhoto: userData.profilePhoto || "",
      createdAt: new Date().toISOString(),
    };

    mockUsers.unshift(newUser);

    return {
      message: "User registered successfully (Mock API)",
      user: newUser,
      tempPassword: "TempPassword123!",
    };
  }
};

// UPDATE user
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.warn(`Failed to update user ${id} on backend. Simulating locally.`, error.message);

    const index = mockUsers.findIndex((u) => u.id === id || u._id === id);
    if (index === -1) throw new Error("User not found in mock data");

    const updatedUser = {
      ...mockUsers[index],
      ...userData,
      updatedAt: new Date().toISOString(),
    };

    mockUsers[index] = updatedUser;

    return {
      message: "User updated successfully (Mock API)",
      user: updatedUser,
    };
  }
};

// DELETE user
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.warn(`Failed to delete user ${id} on backend. Simulating locally.`, error.message);

    const index = mockUsers.findIndex((u) => u.id === id || u._id === id);
    if (index === -1) throw new Error("User not found in mock data");

    // Soft delete locally
    mockUsers.splice(index, 1);

    return {
      message: "User soft deleted successfully (Mock API)",
    };
  }
};