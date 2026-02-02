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

        // Get auth token from request
        const authToken = request.headers.get("Authorization");

        // Forward POST request to external API using env-based URL
        const response = await fetch(API_ENDPOINTS.sendZaloCustomer, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authToken ? { "Authorization": authToken } : {}),
            },
            body: JSON.stringify({ orderId, phone_number }),
        });

        // Handle response - may return empty body
        const responseText = await response.text();
        let data = null;
        if (responseText) {
            try {
                data = JSON.parse(responseText);
            } catch {
                // Response is not JSON, treat as success if status is ok
                console.log("Send Zalo response (non-JSON):", responseText);
            }
        }
        console.log("Send Zalo response:", data || "empty response");

        // Only check response.ok - API may not return code field on success
        if (!response.ok) {
            return NextResponse.json(
                { error: "1", message: data?.message || "Không thể gửi Zalo" },
                { status: response.status || 500 }
            );
        }

        // Return success even if response was empty
        return NextResponse.json(data || { error: "0", message: "Gửi Zalo thành công" });
    } catch (error) {
        console.error("Send Zalo API error:", error);
        return NextResponse.json(
            { error: "1", message: "Lỗi server khi gửi Zalo" },
            { status: 500 }
        );
    }
}
