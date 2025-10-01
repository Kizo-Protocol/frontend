import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const marketId = searchParams.get("marketId");

    const queryParams = new URLSearchParams();

    if (limit) queryParams.append("limit", limit);
    if (offset) queryParams.append("offset", offset);
    if (marketId) queryParams.append("marketId", marketId);

    const backendUrl = `${BACKEND_URL}/api/yields${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

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
          message: "Failed to fetch yields",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}
