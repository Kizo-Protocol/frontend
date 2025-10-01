import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        {
          error: {
            message: "Authorization token required",
          },
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { username, avatarUrl } = body;

    if (username !== undefined) {
      if (typeof username !== "string") {
        return NextResponse.json(
          {
            error: { message: "Username must be a string" },
          },
          { status: 400 },
        );
      }

      if (username.trim().length < 3 || username.trim().length > 30) {
        return NextResponse.json(
          {
            error: { message: "Username must be between 3 and 30 characters" },
          },
          { status: 400 },
        );
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
        return NextResponse.json(
          {
            error: {
              message:
                "Username can only contain letters, numbers, hyphens, and underscores",
            },
          },
          { status: 400 },
        );
      }
    }

    if (avatarUrl !== undefined && avatarUrl !== null) {
      if (typeof avatarUrl !== "string") {
        return NextResponse.json(
          {
            error: { message: "Avatar URL must be a string" },
          },
          { status: 400 },
        );
      }

      if (avatarUrl.trim() && !avatarUrl.match(/^https?:\/\/.+/)) {
        return NextResponse.json(
          {
            error: { message: "Avatar URL must be a valid HTTP/HTTPS URL" },
          },
          { status: 400 },
        );
      }
    }

    const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ username, avatarUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message: "Failed to update profile",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}
