import { UserModel } from "./auth.model";
import { generateToken } from "../../utils/generateToken";
import bcrypt from "bcrypt";

const registerUser = async (userData: any) => {
  const { name, email, password, role } = userData;

  // Input validation
  if (!name || !email || !password) {
    return {
      success: false,
      status: 400,
      message: "Name, email, and password are required",
    };
  }

  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return {
        success: false,
        status: 409,
        message: "User with this email already exists",
      };
    }

    // Create new user
    const user = await UserModel.create({
      name,
      email,
      password,
      role: role || "customer",
    });

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return {
      success: true,
      status: 201,
      data: {
        user: userResponse,
        token,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: error.message,
    };
  }
};

const loginUser = async (userData: any) => {
  const { email, password } = userData;

  // Input validation
  if (!email || !password) {
    return {
      success: false,
      status: 400,
      message: "Email and password are required",
    };
  }

  try {
    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return {
        success: false,
        status: 401,
        message: "Invalid email or password",
      };
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        status: 401,
        message: "Invalid email or password",
      };
    }

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return {
      success: true,
      status: 200,
      data: {
        user: userResponse,
        token,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: error.message,
    };
  }
};

const getMe = async (userId: string) => {
  try {
    // Find user by ID
    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      return {
        success: false,
        status: 404,
        message: "User not found",
      };
    }

    // Return user data without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return {
      success: true,
      status: 200,
      data: {
        user: userResponse,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: error.message,
    };
  }
};

const logoutUser = async () => {
  return {
    success: true,
    status: 200,
    message: "Logged out successfully",
  };
};

const getAllUsers = async () => {
  try {
    // Get all users without password
    const users = await UserModel.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    const usersResponse = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }));

    // Get role counts using aggregation
    const roleCounts = await UserModel.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Extract counts for each role
    const adminCount =
      roleCounts.find((role) => role._id === "admin")?.count || 0;
    const customerCount =
      roleCounts.find((role) => role._id === "customer")?.count || 0;
    const agentCount =
      roleCounts.find((role) => role._id === "agent")?.count || 0;

    // Filter users by role
    const admins = usersResponse.filter((user) => user.role === "admin");
    const customers = usersResponse.filter((user) => user.role === "customer");
    const agents = usersResponse.filter((user) => user.role === "agent");

    return {
      success: true,
      status: 200,
      data: {
        totalUsers: {
          total: users.length,
          users: usersResponse,
        },
        totalAdmins: {
          total: adminCount,
          users: admins,
        },
        totalCustomers: {
          total: customerCount,
          users: customers,
        },
        totalAgents: {
          total: agentCount,
          users: agents,
        },
      },
    };
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: error.message,
    };
  }
};

const deleteUser = async (userId: string) => {
  try {
    // Find and delete the user
    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) {
      return {
        success: false,
        status: 404,
        message: "User not found",
      };
    }

    return {
      success: true,
      status: 200,
      message: "User deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: error.message,
    };
  }
};

export const AuthServices = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  getAllUsers,
  deleteUser,
};
