import { NextResponse } from "next/server";
import { API_ENDPOINTS, getProxyHeaders } from "@/lib/api/config";

/**
 * POST /api/orders/ahamove
 * Create Ahamove delivery order
 * Body: { orderId, service_id, remarks, Tip }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log("Creating Ahamove delivery:", body);

        // Forward request to Ahamove API with auth and x-role headers
        const response = await fetch(API_ENDPOINTS.ahamoveDelivery, {
            method: "POST",
            headers: getProxyHeaders(request),
            body: JSON.stringify(body),
        });

        // Handle potential non-JSON response
        const responseText = await response.text();
        console.log("Ahamove response:", responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            data = { success: response.ok, rawResponse: responseText };
        }

        // Return full response from original API
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Ahamove delivery error:", error);
        return NextResponse.json(
            { error: "1", message: "Lỗi khi tạo đơn Ahamove" },
            { status: 500 }
        );
    }
}
