import { getCollection } from "@/lib/mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/nextAuthOptions";
import { verifyPassword } from "@/lib/serverUtils";

export async function POST(req: NextRequest) {
  try {
    // Check if already logged in
    const session = await getServerSession(authOptions);
    if (session) {
      return NextResponse.json({ error: "Already logged in" }, { status: 400 });
    }

    // Get credentials from request body
    const { username, password } = await req.json();

    // Validate inputs
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Get user collection
    const userCollection = await getCollection("user");

    // Find user by username
    const user = await userCollection.findOne({ username });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password);

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Return success
    return NextResponse.json(
      { message: "Login successful", userId: user._id, userRole: user.role },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
