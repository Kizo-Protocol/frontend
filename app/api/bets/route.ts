import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryString = searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/bets${queryString ? `?${queryString}` : ""}`;

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
          message: "Failed to fetch bets",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketIdentifier, position, amount, userAddress } = body;

    if (
      !marketIdentifier ||
      typeof position !== "boolean" ||
      !amount ||
      !userAddress
    ) {
      return NextResponse.json(
        {
          error: {
            message: "Missing required fields",
            required: ["marketIdentifier", "position", "amount", "userAddress"],
          },
        },
        { status: 400 },
      );
    }

    const betAmount = parseFloat(amount);

    if (isNaN(betAmount) || betAmount <= 0) {
      return NextResponse.json(
        {
          error: { message: "Amount must be a positive number" },
        },
        { status: 400 },
      );
    }

    if (!userAddress.match(/^0x[a-fA-F0-9]{1,64}$/)) {
      return NextResponse.json(
        {
          error: { message: "Invalid Aptos wallet address format" },
        },
        { status: 400 },
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/bets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message: "Failed to place bet",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}
