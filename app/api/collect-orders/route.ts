import { NextResponse } from "next/server";
import { API_ENDPOINTS, getProxyHeaders } from "@/lib/api/config";

/**
 * GET /api/collect-orders
 * Fetch collect orders grouped by delivery date
 */
export async function GET(request: Request) {
    try {
        console.log("Fetching collect-orders from:", API_ENDPOINTS.collectOrders);

        // Forward request with auth and x-role headers
        const response = await fetch(API_ENDPOINTS.collectOrders, {
            method: "GET",
            headers: getProxyHeaders(request),
        });

        // Return full response from original API
        const data = await response.json();
        console.log("Collect orders fetched, status:", response.status);
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Collect Orders API error:", error);
        return NextResponse.json(
            { error: "1", message: "Failed to fetch collect orders" },
            { status: 500 }
        );
    }
}
