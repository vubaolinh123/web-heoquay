import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api/config";

/**
 * POST /api/orders/shipper-confirm
 * Shipper confirms/accepts an order
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, shipper } = body;

        if (!orderId || !shipper) {
            return NextResponse.json(
                { error: "1", message: "orderId và shipper là bắt buộc" },
                { status: 400 }
            );
        }

        // Forward to external API
        const response = await fetch(API_ENDPOINTS.shipperConfirm, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId, shipper }),
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
