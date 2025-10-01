import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ identifier: string }> },
) {
  try {
    const { identifier } = await context.params;
    const { searchParams } = new URL(request.url);

    if (!identifier) {
      return NextResponse.json(
        {
          error: { message: "Market identifier is required" },
        },
        { status: 400 },
      );
    }

    const queryString = searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/charts/market/${encodeURIComponent(identifier)}/probability${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
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
          message: "Failed to fetch probability data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}
