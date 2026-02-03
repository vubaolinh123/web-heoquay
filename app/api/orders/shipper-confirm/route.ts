import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, getProxyHeaders } from "@/lib/api/config";

/**
 * POST /api/orders/shipper-confirm
 * Shipper confirms/accepts an order
 * Body: { orderId, shipper, sendBy? }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log("Shipper confirm:", body);

        // Forward to external API with auth and x-role headers
        const response = await fetch(API_ENDPOINTS.shipperConfirm, {
            method: "POST",
            headers: getProxyHeaders(request),
            body: JSON.stringify(body),
        });

        // Return full response from original API
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
