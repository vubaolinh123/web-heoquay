import { NextResponse } from "next/server";
import { API_ENDPOINTS, getAuthHeaders, getTokenFromRequest } from "@/lib/api/config";

/**
 * GET /api/collect-orders
 * Fetch collect orders grouped by delivery date
 */
export async function GET(request: Request) {
    try {
        const token = getTokenFromRequest(request);

        if (!token) {
            return NextResponse.json(
                { error: "1", message: "Unauthorized - Please login" },
                { status: 401 }
            );
        }

        console.log("Fetching collect-orders from:", API_ENDPOINTS.collectOrders);

        const response = await fetch(API_ENDPOINTS.collectOrders, {
            method: "GET",
            headers: getAuthHeaders(token),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Collect Orders API Error:", response.status, errorText);
            return NextResponse.json(
                { error: "1", message: errorText || "Failed to fetch collect orders" },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log("Collect orders fetched, days count:", Array.isArray(data.data) ? data.data.length : "N/A");
        return NextResponse.json(data);
    } catch (error) {
        console.error("Collect Orders API error:", error);
        return NextResponse.json(
            { error: "1", message: "Failed to fetch collect orders" },
            { status: 500 }
        );
    }
}
