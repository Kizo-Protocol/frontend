import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        {
          error: {
            message: "Wallet address is required",
          },
        },
        { status: 400 },
      );
    }

    if (!address.match(/^0x[a-fA-F0-9]{1,64}$/)) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid Aptos wallet address format",
          },
        },
        { status: 400 },
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/auth/wallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
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
          message: "Failed to connect wallet",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}
