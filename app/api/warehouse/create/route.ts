import { NextResponse } from "next/server";
import { API_ENDPOINTS, getProxyHeaders } from "@/lib/api/config";

/**
 * POST /api/warehouse/create
 * Create or update a warehouse item
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("=== Warehouse CREATE/UPDATE ===");
        console.log("Request body:", JSON.stringify(body, null, 2));

        const response = await fetch(API_ENDPOINTS.warehouseCreate, {
            method: "POST",
            headers: getProxyHeaders(request),
            body: JSON.stringify(body),
        });

        console.log("Response status:", response.status);

        // Handle potential non-JSON response
        const responseText = await response.text();
        console.log("Response body:", responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            data = { success: true, rawResponse: responseText };
        }

        // Return full response from original API
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Warehouse CREATE/UPDATE error:", error);
        return NextResponse.json(
            { error: "1", message: "Failed to create/update warehouse item" },
            { status: 500 }
        );
    }
}
