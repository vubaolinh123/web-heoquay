import { NextResponse } from "next/server";
import { API_ENDPOINTS, getProxyHeaders } from "@/lib/api/config";

/**
 * GET /api/warehouse
 * Fetch all warehouse items
 */
export async function GET(request: Request) {
    try {
        console.log("Fetching warehouse from:", API_ENDPOINTS.warehouse);

        const response = await fetch(API_ENDPOINTS.warehouse, {
            method: "GET",
            headers: getProxyHeaders(request),
        });

        // Return full response from original API
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Warehouse API error:", error);
        return NextResponse.json(
            { error: "1", message: "Failed to fetch warehouse data" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/warehouse
 * Delete a warehouse item by maNvl
 */
export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        console.log("Deleting warehouse item:", body);

        const response = await fetch(API_ENDPOINTS.warehouse, {
            method: "DELETE",
            headers: getProxyHeaders(request),
            body: JSON.stringify(body),
        });

        // Return full response from original API
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Warehouse DELETE error:", error);
        return NextResponse.json(
            { error: "1", message: "Failed to delete warehouse item" },
            { status: 500 }
        );
    }
}
