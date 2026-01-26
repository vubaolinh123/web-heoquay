import { NextResponse } from "next/server";
import { API_ENDPOINTS, getAuthHeaders, getTokenFromRequest } from "@/lib/api/config";

/**
 * GET /api/warehouse
 * Fetch all warehouse items
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

        console.log("Fetching warehouse from:", API_ENDPOINTS.warehouse);

        const response = await fetch(API_ENDPOINTS.warehouse, {
            method: "GET",
            headers: getAuthHeaders(token),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Warehouse GET Error:", response.status, errorText);
            return NextResponse.json(
                { error: "1", message: errorText || "Failed to fetch warehouse" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
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
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: "1", message: "Unauthorized - Please login" },
                { status: 401 }
            );
        }

        const body = await request.json();
        console.log("Deleting warehouse item:", body);

        const response = await fetch(API_ENDPOINTS.warehouse, {
            method: "DELETE",
            headers: getAuthHeaders(token),
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Warehouse DELETE Error:", response.status, errorText);
            return NextResponse.json(
                { error: "1", message: errorText || "Failed to delete" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Warehouse DELETE error:", error);
        return NextResponse.json(
            { error: "1", message: "Failed to delete warehouse item" },
            { status: 500 }
        );
    }
}
