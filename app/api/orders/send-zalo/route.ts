import { NextResponse } from "next/server";
import { API_ENDPOINTS, getProxyHeaders } from "@/lib/api/config";

/**
 * POST /api/orders/send-zalo
 * Proxy to send Zalo message to customer
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log("Sending Zalo to customer:", body);

        // Forward POST request to external API with auth and x-role headers
        const response = await fetch(API_ENDPOINTS.sendZaloCustomer, {
            method: "POST",
            headers: getProxyHeaders(request),
            body: JSON.stringify(body),
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

        // Return full response or default success message
        return NextResponse.json(
            data || { error: "0", message: "Gửi Zalo thành công" },
            { status: response.status }
        );
    } catch (error) {
        console.error("Send Zalo API error:", error);
        return NextResponse.json(
            { error: "1", message: "Lỗi server khi gửi Zalo" },
            { status: 500 }
        );
    }
}
