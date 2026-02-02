import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api/config";

/**
 * POST /api/orders/shipper-confirm
 * Shipper confirms/accepts an order
 * Body: { orderId, shipper, sendBy? }
 * - sendBy: optional, set to "Admin" when admin assigns shipper
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, shipper, sendBy } = body;

        if (!orderId || !shipper) {
            return NextResponse.json(
                { error: "1", message: "orderId và shipper là bắt buộc" },
                { status: 400 }
            );
        }

        // Build request body
        const requestBody: { orderId: string; shipper: string; sendBy?: string } = {
            orderId,
            shipper,
        };

        // Add sendBy if provided (for Admin assignments)
        if (sendBy) {
            requestBody.sendBy = sendBy;
        }

        // Forward to external API
        const response = await fetch(API_ENDPOINTS.shipperConfirm, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Shipper confirm error:", error);
        return NextResponse.json(
            { error: "1", message: "Có lỗi xảy ra khi xác nhận đơn" },
            { status: 500 }
        );
    }
}
