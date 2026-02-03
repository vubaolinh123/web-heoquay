import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, getProxyHeaders } from "@/lib/api/config";

/**
 * GET /api/shippers
 * Fetch list of shippers from external API
 */
export async function GET(request: NextRequest) {
    try {
        console.log("Fetching shippers from:", API_ENDPOINTS.shippers);

        // Call external API with auth and x-role headers
        const response = await fetch(API_ENDPOINTS.shippers, {
            method: "GET",
            headers: getProxyHeaders(request),
        });

        // Return full response from original API
        const data = await response.json();
        console.log("Shippers fetched, status:", response.status);
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Shippers API error:", error);
        return NextResponse.json(
            { error: "1", message: "Có lỗi xảy ra khi lấy danh sách shipper" },
            { status: 500 }
        );
    }
}
