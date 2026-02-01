import { NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api/config";

/**
 * POST /api/orders/send-zalo
 * Proxy to send Zalo message to customer
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderId, phone_number } = body;

        if (!orderId || !phone_number) {
            return NextResponse.json(
                { error: "1", message: "orderId và phone_number là bắt buộc" },
                { status: 400 }
            );
        }

        console.log("Sending Zalo to customer:", { orderId, phone_number });

        // Forward POST request to external API using env-based URL
        const response = await fetch(API_ENDPOINTS.sendZaloCustomer, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId, phone_number }),
        });

        const data = await response.json();
        console.log("Send Zalo response:", data);

        if (!response.ok || data.code >= 400) {
            return NextResponse.json(
                { error: "1", message: data.message || "Không thể gửi Zalo" },
                { status: response.status || 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Send Zalo API error:", error);
        return NextResponse.json(
            { error: "1", message: "Lỗi server khi gửi Zalo" },
            { status: 500 }
        );
    }
}
