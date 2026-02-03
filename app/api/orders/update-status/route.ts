import { NextResponse } from "next/server";
import { API_ENDPOINTS, getProxyHeaders } from "@/lib/api/config";

/**
 * POST /api/orders/update-status
 * Proxy to update order status, avoiding CORS issues
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log("Updating order status:", body);

        // Forward POST request to external API with auth and x-role headers
        const response = await fetch(API_ENDPOINTS.ordersUpdateStatus, {
            method: "POST",
            headers: getProxyHeaders(request),
            body: JSON.stringify(body),
        });

        // Return full response from original API
        const data = await response.json();
        console.log("Update status response:", data);
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Update status API error:", error);
        return NextResponse.json(
            { error: "1", message: "Lỗi server khi cập nhật trạng thái" },
            { status: 500 }
        );
    }
}
