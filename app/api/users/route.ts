import { NextRequest, NextResponse } from "next/server";
// import { API_ENDPOINTS } from "@/lib/api/config";

/**
 * User Management API
 * PLACEHOLDER - Update with actual API when ready
 */

// Mock users data
const mockUsers = [
    { id: "1", userName: "heoquay", role: "Admin", createdAt: "2026-01-01" },
    { id: "2", userName: "shipper1", role: "Shipper", createdAt: "2026-01-15" },
];

/**
 * GET /api/users - Get all users
 */
export async function GET() {
    try {
        // PLACEHOLDER: Return mock data
        // TODO: Replace with actual API call
        return NextResponse.json({
            error: "0",
            message: "Thành công",
            data: mockUsers
        });
    } catch (error) {
        console.error("Get users error:", error);
        return NextResponse.json(
            { error: "1", message: "Có lỗi xảy ra" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/users - Create new user
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userName, password, role } = body;

        if (!userName || !password) {
            return NextResponse.json(
                { error: "1", message: "userName và password là bắt buộc" },
                { status: 400 }
            );
        }

        // PLACEHOLDER: Return success
        // TODO: Replace with actual API call
        return NextResponse.json({
            error: "0",
            message: "Tạo user thành công",
            data: {
                id: Date.now().toString(),
                userName,
                role: role || "Shipper",
                createdAt: new Date().toISOString().split("T")[0]
            }
        });
    } catch (error) {
        console.error("Create user error:", error);
        return NextResponse.json(
            { error: "1", message: "Có lỗi xảy ra" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/users - Delete user
 */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("id");

        if (!userId) {
            return NextResponse.json(
                { error: "1", message: "id là bắt buộc" },
                { status: 400 }
            );
        }

        // PLACEHOLDER: Return success
        // TODO: Replace with actual API call
        return NextResponse.json({
            error: "0",
            message: "Xóa user thành công"
        });
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json(
            { error: "1", message: "Có lỗi xảy ra" },
            { status: 500 }
        );
    }
}
