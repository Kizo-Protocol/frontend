import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ betId: string }> },
) {
  try {
    const { betId } = await context.params;

    if (!betId) {
      return NextResponse.json(
        {
          error: { message: "Bet ID is required" },
        },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/bets/${encodeURIComponent(betId)}`,
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
        error: {
          message: "Failed to fetch bet",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}
