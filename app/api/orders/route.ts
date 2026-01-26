import { NextResponse } from "next/server";
import { API_ENDPOINTS, getAuthHeaders, getTokenFromRequest } from "@/lib/api/config";

/**
 * GET /api/orders
 * Fetch all orders from the external API
 * Uses token from user's login session
 */
export async function GET(request: Request) {
    try {
        // Get token from request (passed from client with their login token)
        const token = getTokenFromRequest(request);

        console.log("=== Orders API ===");
        console.log("Token from client:", token ? `${token.substring(0, 30)}...` : "NONE");

        if (!token) {
            return NextResponse.json(
                { error: "1", message: "Unauthorized - Please login" },
                { status: 401 }
            );
        }

        console.log("Fetching orders from:", API_ENDPOINTS.orders);

        // Use token from login for external API
        const response = await fetch(API_ENDPOINTS.orders, {
            method: "GET",
            headers: getAuthHeaders(token),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Orders API Error:", response.status, errorText);
            return NextResponse.json(
                { error: "1", message: errorText || "Failed to fetch orders" },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log("Orders fetched successfully, count:", Array.isArray(data.data) ? data.data.length : "N/A");
        return NextResponse.json(data);
    } catch (error) {
        console.error("Orders API error:", error);
        return NextResponse.json(
            { error: "1", message: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}
