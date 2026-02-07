import { NextResponse } from "next/server";

const UPDATE_TYPES_API = "https://asia-82692522.phoaify.com/webhook/api/v1/heoquay/update-types";

interface UpdateTypesRequest {
    orderIds: string[];
    type: number;
    status?: string; // For type=2 (update status), this is the target status
}

/**
 * POST /api/orders/update-types
 * Bulk update orders by type
 * type: 1 = Gửi nhóm Ship, 2 = Update trạng thái, 3 = Gửi xác nhận, 4 = Gửi mã thanh toán
 */
export async function POST(request: Request) {
    try {
        const body: UpdateTypesRequest = await request.json();
        const { orderIds, type, status } = body;

        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return NextResponse.json(
                { error: "1", message: "orderIds là bắt buộc" },
                { status: 400 }
            );
        }

        if (!type || ![1, 2, 3, 4].includes(type)) {
            return NextResponse.json(
                { error: "1", message: "type phải là 1, 2, 3 hoặc 4" },
                { status: 400 }
            );
        }

        // Build request body for external API
        const externalBody: { orderIds: string[]; type: number; status?: string } = {
            orderIds,
            type,
        };

        // Include status for type=2
        if (type === 2 && status) {
            externalBody.status = status;
        }

        console.log("Bulk update orders:", externalBody);

        const response = await fetch(UPDATE_TYPES_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(externalBody),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: "1", message: data.message || "Không thể cập nhật đơn hàng" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Update types API error:", error);
        return NextResponse.json(
            { error: "1", message: "Lỗi server khi cập nhật đơn hàng" },
            { status: 500 }
        );
    }
}
