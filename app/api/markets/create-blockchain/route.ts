import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { question, category, endTime, initialFunding } = body;

    if (!question || !category || !endTime || !initialFunding) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message:
            "question, category, endTime, and initialFunding are required",
        },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/markets/create-blockchain`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || `Backend responded with status: ${response.status}`,
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create market",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
