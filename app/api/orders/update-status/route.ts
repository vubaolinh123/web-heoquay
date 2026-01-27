import { NextResponse } from "next/server";

const UPDATE_STATUS_API = "https://asia-82692522.n8nhosting.cloud/webhook/api/v1/heoquay/orders/update-status";

/**
 * POST /api/orders/update-status
 * Proxy to update order status, avoiding CORS issues
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderId, status } = body;

        if (!orderId || !status) {
            return NextResponse.json(
                { error: "1", message: "orderId và status là bắt buộc" },
                { status: 400 }
            );
        }

        console.log("Updating order status:", { orderId, status });

        const response = await fetch(UPDATE_STATUS_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId, status }),
        });

        const data = await response.json();
        console.log("Update status response:", data);

        if (!response.ok) {
            return NextResponse.json(
                { error: "1", message: data.message || "Không thể cập nhật trạng thái" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Update status API error:", error);
        return NextResponse.json(
            { error: "1", message: "Lỗi server khi cập nhật trạng thái" },
            { status: 500 }
        );
    }
}
