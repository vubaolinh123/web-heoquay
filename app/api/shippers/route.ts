import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, getAuthHeaders, getTokenFromRequest } from "@/lib/api/config";

/**
 * GET /api/shippers
 * Fetch list of shippers from external API
 */
export async function GET(request: NextRequest) {
    try {
        // Get token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            return NextResponse.json(
                { error: "1", message: "Unauthorized - Please login" },
                { status: 401 }
            );
        }

        console.log("Fetching shippers from:", API_ENDPOINTS.shippers);

        // Call external API to get shippers list
        const response = await fetch(API_ENDPOINTS.shippers, {
            method: "GET",
            headers: getAuthHeaders(token),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Shippers API Error:", response.status, errorText);
            return NextResponse.json(
                { error: "1", message: errorText || "Không thể lấy danh sách shipper" },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log("Shippers fetched successfully");

        return NextResponse.json({
            error: "0",
            message: "Thành công",
            data: data.data || data,
        });
    } catch (error) {
        console.error("Shippers API error:", error);
        return NextResponse.json(
            { error: "1", message: "Có lỗi xảy ra khi lấy danh sách shipper" },
            { status: 500 }
        );
    }
}
