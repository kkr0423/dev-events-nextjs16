import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { Event } from "@/database";

// TypeScript interface for route params
interface RouteParams {
  params: {
    slug: string;
  };
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing the slug
 * @returns Event data or error response
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Extract and validate slug parameter
    const { slug } = await params;

    // Validate slug is provided and not empty
    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing slug parameter",
        },
        { status: 400 }
      );
    }

    // Validate slug format (URL-friendly: lowercase, hyphens, alphanumeric)
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid slug format. Slug must be lowercase alphanumeric with hyphens.",
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Query event by slug
    const event = await Event.findOne({ slug }).lean();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404 }
      );
    }

    // Return successful response with event data
    return NextResponse.json(
      {
        success: true,
        event,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    console.error("Error fetching event by slug:", error);

    // Return generic error response (don't expose internal errors to client)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while fetching the event",
      },
      { status: 500 }
    );
  }
}
