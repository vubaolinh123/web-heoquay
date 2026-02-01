import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api/config";

/**
 * POST /api/orders/check-paid
 * Check if an order has been paid
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

        // Call external API to check payment status
        const response = await fetch(API_ENDPOINTS.orderCheckPaid, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: "1", message: data.message || "Không thể kiểm tra thanh toán" },
                { status: response.status }
            );
        }

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
