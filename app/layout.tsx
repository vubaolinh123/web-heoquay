import type { Metadata, Viewport } from "next";
import { OrdersProvider, AuthProvider } from "@/contexts";
import ProtectedRoute from "@/components/ProtectedRoute";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heo Quay Ngọc Hải - Quản Lý Đơn Hàng",
  description: "Hệ thống quản lý đơn hàng heo quay Ngọc Hải",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Heo Quay Ngọc Hải",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#D32F2F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <ProtectedRoute>
            <OrdersProvider>
              {children}
            </OrdersProvider>
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}


