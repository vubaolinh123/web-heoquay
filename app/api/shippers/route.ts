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

        // Handle non-JSON response (HTML error page, etc.)
        const contentType = response.headers.get("content-type");
        const responseText = await response.text();

        if (!contentType?.includes("application/json")) {
            console.error("Shippers API returned non-JSON:", responseText.substring(0, 200));
            return NextResponse.json(
                { error: "1", message: "API server error - invalid response" },
                { status: 502 }
            );
        }

        // Parse JSON response
        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            console.error("Failed to parse JSON:", responseText.substring(0, 200));
            return NextResponse.json(
                { error: "1", message: "Invalid JSON response from API" },
                { status: 502 }
            );
        }

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
