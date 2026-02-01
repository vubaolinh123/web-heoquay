import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, getAuthHeaders, getTokenFromRequest } from "@/lib/api/config";

/**
 * POST /api/orders/qr-payment
 * Get QR code for bank transfer payment
 * Returns base64 image from external API
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

        console.log("Getting QR payment for order:", orderId);

        // Call external API to get QR code with auth token
        const response = await fetch(API_ENDPOINTS.orderPayment, {
            method: "POST",
            headers: getAuthHeaders(token),
            body: JSON.stringify({ orderId }),
        });

        // Check if response is JSON
        const contentType = response.headers.get("content-type");

        if (!response.ok) {
            const errorText = await response.text();
            console.error("QR payment API Error:", response.status, errorText);
            return NextResponse.json(
                { error: "1", message: errorText || "Không thể lấy mã QR" },
                { status: response.status }
            );
        }

        // If response is not JSON, it might be the raw image data
        if (contentType && !contentType.includes("application/json")) {
            // Response is raw data (possibly base64 string or image)
            const text = await response.text();
            return NextResponse.json({
                error: "0",
                message: "Thành công",
                data: { qrBase64: text, orderId },
            });
        }

        const data = await response.json();
        console.log("QR payment response received");

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
