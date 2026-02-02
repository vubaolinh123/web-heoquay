"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    ReactNode,
} from "react";
import { ordersApi, transformApiOrder } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { DonHang } from "@/lib/types";

// ===========================================
// Context Types
// ===========================================

interface OrdersContextValue {
    /** All orders from API */
    orders: DonHang[];
    /** Orders grouped by date key (YYYY-MM-DD) */
    ordersMap: Map<string, DonHang[]>;
    /** Loading state */
    isLoading: boolean;
    /** Error message if any */
    error: string | null;
    /** Refetch orders from API */
    refetch: () => Promise<void>;
}

// ===========================================
// Context
// ===========================================

const OrdersContext = createContext<OrdersContextValue | null>(null);

// ===========================================
// Provider Component
// ===========================================

interface OrdersProviderProps {
    children: ReactNode;
}

export function OrdersProvider({ children }: OrdersProviderProps) {
    const [orders, setOrders] = useState<DonHang[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get auth state to ensure token is ready
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    // Fetch orders from API
    const fetchOrders = useCallback(async () => {
        // Only fetch if authenticated
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const apiOrders = await ordersApi.getOrders();
            const transformedOrders = apiOrders.map(transformApiOrder);
            setOrders(transformedOrders);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải đơn hàng");
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    // Build ordersMap for calendar views - group by date
    const ordersMap = useMemo(() => {
        const map = new Map<string, DonHang[]>();
        orders.forEach((order) => {
            const dateKey = order.ngay.toISOString().split("T")[0];
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(order);
        });
        return map;
    }, [orders]);

    // NOTE: Auto-fetch is DISABLED to prevent duplicate API calls.
    // Pages should call refetch() manually when they need data.
    // This prevents the issue where OrdersContext fetches AND page also fetches.
    useEffect(() => {
        // Only set loading to false when auth is ready
        if (!authLoading) {
            setIsLoading(false);
        }
    }, [authLoading]);

    const value: OrdersContextValue = {
        orders,
        ordersMap,
        isLoading,
        error,
        refetch: fetchOrders,
    };

    return (
        <OrdersContext.Provider value={value}>
            {children}
        </OrdersContext.Provider>
    );
}

// ===========================================
// Custom Hook
// ===========================================

/**
 * Hook to access orders data from context
 * Must be used within OrdersProvider
 */
export function useOrders(): OrdersContextValue {
    const context = useContext(OrdersContext);
    if (!context) {
        throw new Error("useOrders must be used within an OrdersProvider");
    }
    return context;
}
