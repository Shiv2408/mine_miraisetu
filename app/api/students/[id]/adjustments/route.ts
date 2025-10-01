import { NextRequest, NextResponse } from "next/server";
import { feesService } from "@/lib/services/fees.service";

/**
 * GET handler
 * - request is first arg
 * - context.params is a Promise<{ id: string }>
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // await because params is a Promise
    const studentId = id;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    const adjustments = await feesService.getFeeAdjustments(studentId);

    return NextResponse.json({ adjustments });
  } catch (error) {
    console.error("Error fetching fee adjustments:", error);
    return NextResponse.json(
      { error: "Failed to fetch fee adjustments" },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler
 * - only needs the request object here
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { adjustmentId, action, cancellationReason } = body ?? {};

    if (!adjustmentId) {
      return NextResponse.json(
        { error: "Adjustment ID is required" },
        { status: 400 }
      );
    }

    if (action === "cancel") {
      if (!cancellationReason || !String(cancellationReason).trim()) {
        return NextResponse.json(
          { error: "Cancellation reason is required" },
          { status: 400 }
        );
      }

      const cancelledAdjustment = await feesService.cancelAdjustment(
        adjustmentId,
        String(cancellationReason).trim()
      );

      return NextResponse.json({
        success: true,
        adjustment: cancelledAdjustment,
        message: "Adjustment cancelled successfully",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating adjustment:", error);
    return NextResponse.json(
      {
        error: "Failed to update adjustment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
