import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, getProxyHeaders } from "@/lib/api/config";

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

        console.log("Getting QR payment for order:", orderId);

        // Call external API with auth and x-role headers
        const response = await fetch(API_ENDPOINTS.orderPayment, {
            method: "POST",
            headers: getProxyHeaders(request),
            body: JSON.stringify({ orderId }),
        });

        // Handle non-JSON response (raw image data)
        const contentType = response.headers.get("content-type");
        if (contentType && !contentType.includes("application/json")) {
            const text = await response.text();
            return NextResponse.json({
                qrBase64: text,
                orderId,
            }, { status: response.status });
        }

        // Return full JSON response from original API
        const data = await response.json();
        console.log("QR payment response received");
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("QR payment error:", error);
        return NextResponse.json(
            { error: "1", message: "Có lỗi xảy ra khi lấy QR" },
            { status: 500 }
        );
    }
}
