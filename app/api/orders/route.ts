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

        // Debug: Log request headers
        const headers = getProxyHeaders(request);
        console.log("Request headers being sent:", JSON.stringify(headers, null, 2));

        // Forward request to external API with auth and x-role headers
        const response = await fetch(API_ENDPOINTS.orders, {
            method: "GET",
            headers: headers,
        });

        // Handle non-JSON response (HTML error page, etc.)
        const contentType = response.headers.get("content-type");
        const responseText = await response.text();

        if (!contentType?.includes("application/json")) {
            // Log more details about Cloudflare response
            console.error("Orders API returned non-JSON. Status:", response.status);
            console.error("Response headers:", JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
            console.error("Response body (first 500 chars):", responseText.substring(0, 500));
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
