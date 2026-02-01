import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, getAuthHeaders, getTokenFromRequest } from "@/lib/api/config";

/**
 * POST /api/orders/check-paid
 * Check if an order has been paid
 */
export async function POST(request: NextRequest) {
    try {
        // Get token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            return NextResponse.json(
                { error: "1", message: "Unauthorized - Please login" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json(
                { error: "1", message: "orderId là bắt buộc" },
                { status: 400 }
            );
        }

        console.log("Checking payment for order:", orderId);

        // Call external API to check payment status with auth token
        const response = await fetch(API_ENDPOINTS.orderCheckPaid, {
            method: "POST",
            headers: getAuthHeaders(token),
            body: JSON.stringify({ orderId }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Check paid API Error:", response.status, errorText);
            return NextResponse.json(
                { error: "1", message: errorText || "Không thể kiểm tra thanh toán" },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log("Check paid response:", data);

        return NextResponse.json({
            error: "0",
            message: "Thành công",
            data: data.data || data,
        });
    } catch (error) {
        console.error("Check paid error:", error);
        return NextResponse.json(
            { error: "1", message: "Có lỗi xảy ra khi kiểm tra thanh toán" },
            { status: 500 }
        );
    }
}
