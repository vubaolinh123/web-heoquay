import { NextResponse } from "next/server";

const SEARCH_ADDRESS_API = "https://asia-82692522.phoaify.com/webhook/api/v1/heoquay/ahamove/search-address";

/**
 * GET /api/ahamove/search-address
 * Search for address suggestions
 * Query param: keySearch
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const keySearch = searchParams.get("keySearch");

        if (!keySearch || keySearch.trim().length < 2) {
            return NextResponse.json(
                { error: "0", data: [] },
                { status: 200 }
            );
        }

        const response = await fetch(
            `${SEARCH_ADDRESS_API}?keySearch=${encodeURIComponent(keySearch)}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: "1", message: data.message || "Không thể tìm kiếm địa chỉ" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Search address API error:", error);
        return NextResponse.json(
            { error: "1", message: "Lỗi server khi tìm kiếm địa chỉ" },
            { status: 500 }
        );
    }
}
