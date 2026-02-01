import { NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api/config";

/**
 * POST /api/orders/update
 * Proxy to update order items - forwards to n8n webhook as POST request
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderId, items } = body;

        if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: "1", message: "orderId và items là bắt buộc" },
                { status: 400 }
            );
        }

        console.log("Updating order:", { orderId, items });

        // Forward POST request to external API using env-based URL
        const response = await fetch(API_ENDPOINTS.ordersUpdate, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId, items }),
        });

        const data = await response.json();
        console.log("Update order response:", data);

        if (!response.ok || data.code >= 400) {
            return NextResponse.json(
                { error: "1", message: data.message || "Không thể cập nhật đơn hàng" },
                { status: response.status || 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Update order API error:", error);
        return NextResponse.json(
            { error: "1", message: "Lỗi server khi cập nhật đơn hàng" },
            { status: 500 }
        );
    }
}
