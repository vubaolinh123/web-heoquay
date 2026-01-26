import { NextResponse } from "next/server";
import { API_ENDPOINTS, getAuthHeaders, getTokenFromRequest } from "@/lib/api/config";

/**
 * POST /api/warehouse/create
 * Create or update a warehouse item
 */
export async function POST(request: Request) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: "1", message: "Unauthorized - Please login" },
                { status: 401 }
            );
        }

        const body = await request.json();
        console.log("=== Warehouse CREATE/UPDATE ===");
        console.log("Request body:", JSON.stringify(body, null, 2));

        const response = await fetch(API_ENDPOINTS.warehouseCreate, {
            method: "POST",
            headers: getAuthHeaders(token),
            body: JSON.stringify(body),
        });

        console.log("Response status:", response.status);
        const responseText = await response.text();
        console.log("Response body:", responseText);

        if (!response.ok) {
            return NextResponse.json(
                { error: "1", message: responseText || `API error: ${response.status}` },
                { status: response.status }
            );
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            data = { success: true };
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Warehouse CREATE/UPDATE error:", error);
        return NextResponse.json(
            { error: "1", message: "Failed to create/update warehouse item" },
            { status: 500 }
        );
    }
}
