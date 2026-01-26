import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api/config";

const LOGIN_URL = `${API_BASE_URL}/login`;

/**
 * POST /api/auth/login
 * Proxy login request to external API
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log("=== Login Request ===");
        console.log("Endpoint:", LOGIN_URL);
        console.log("Username:", body.userName);

        const response = await fetch(LOGIN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const responseText = await response.text();
        console.log("Login response status:", response.status);
        console.log("Login response body:", responseText);

        // Parse response
        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            return NextResponse.json(
                { error: "1", message: "Invalid response from server" },
                { status: 500 }
            );
        }

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Login API error:", error);
        return NextResponse.json(
            {
                error: "1",
                message: "Có lỗi xảy ra khi đăng nhập",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
