import { NextResponse } from "next/server";
import { API_ENDPOINTS, getProxyHeaders } from "@/lib/api/config";

/**
 * GET /api/orders
 * Fetch all orders from the external API
 * Uses token from user's login session
 */
export async function GET(request: Request) {
    try {
        console.log("Fetching orders from:", API_ENDPOINTS.orders);

        // Forward request to external API with auth and x-role headers
        const response = await fetch(API_ENDPOINTS.orders, {
            method: "GET",
            headers: getProxyHeaders(request),
        });

        // Return full response from original API
        const data = await response.json();
        console.log("Orders fetched, status:", response.status);
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Orders API error:", error);
        return NextResponse.json(
            { error: "1", message: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}
