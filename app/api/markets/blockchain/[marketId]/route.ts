import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ marketId: string }> },
) {
  try {
    const { marketId } = await context.params;

    if (!marketId) {
      return NextResponse.json(
        {
          success: false,
          error: "Market ID is required",
        },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/markets/blockchain/${marketId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch blockchain market data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
