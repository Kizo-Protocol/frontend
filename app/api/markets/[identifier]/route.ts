import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ identifier: string }> },
) {
  try {
    const { identifier } = await context.params;

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          error: "Market identifier is required",
        },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/markets/${encodeURIComponent(identifier)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch market data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
