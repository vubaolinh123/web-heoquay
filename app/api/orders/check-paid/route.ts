import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, getProxyHeaders } from "@/lib/api/config";

/**
 * POST /api/orders/check-paid
 * Check if an order has been paid
 * Logic: error=0 means paid, otherwise unpaid
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json(
                { error: "1", message: "orderId là bắt buộc" },
                { status: 400 }
            );
        }

        console.log("Checking payment for order:", orderId);

        // Call external API with auth and x-role headers
        const response = await fetch(API_ENDPOINTS.orderCheckPaid, {
            method: "POST",
            headers: getProxyHeaders(request),
            body: JSON.stringify({ orderId }),
        });

        // Return full response from original API
        const data = await response.json();
        console.log("Check paid response:", data);

        // Logic: error=0 means paid, otherwise unpaid
        // Add isPaid field based on error value
        return NextResponse.json({
            ...data,
            isPaid: data.error === "0" || data.error === 0,
        }, { status: response.status });
    } catch (error) {
        console.error("Check paid error:", error);
        return NextResponse.json(
            { error: "1", message: "Có lỗi xảy ra khi kiểm tra thanh toán", isPaid: false },
            { status: 500 }
        );
    }
}
