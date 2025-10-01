import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export async function PUT(
  request: NextRequest,
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

    const body = await request.json();

    const { imageUrl } = body;

    if (imageUrl !== undefined && imageUrl !== null) {
      if (typeof imageUrl !== "string") {
        return NextResponse.json(
          {
            success: false,
            error: "Image URL must be a string",
          },
          { status: 400 },
        );
      }

      if (imageUrl.trim() && !imageUrl.match(/^https?:\/\/.+/)) {
        return NextResponse.json(
          {
            success: false,
            error: "Image URL must be a valid HTTP/HTTPS URL",
          },
          { status: 400 },
        );
      }
    }

    const response = await fetch(
      `${BACKEND_URL}/api/markets/${encodeURIComponent(identifier)}/image`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
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
        error: "Failed to update market image",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
