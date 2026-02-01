import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api/config";

/**
 * POST /api/orders/qr-payment
 * Get QR code for bank transfer payment
 * Returns base64 image from external API
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

        // Call external API to get QR code
        const response = await fetch(API_ENDPOINTS.orderPayment, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: "1", message: data.message || "Không thể lấy mã QR" },
                { status: response.status }
            );
        }

        // Return base64 image data from API
        return NextResponse.json({
            error: "0",
            message: "Thành công",
            data: data.data || data,
        });
    } catch (error) {
        console.error("QR payment error:", error);
        return NextResponse.json(
            { error: "1", message: "Có lỗi xảy ra khi lấy QR" },
            { status: 500 }
        );
    }
}
