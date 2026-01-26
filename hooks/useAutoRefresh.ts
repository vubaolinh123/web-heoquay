"use client";

import { useEffect, useRef, useCallback, useState } from "react";

// Get refresh interval from environment variable (default: 300 seconds = 5 minutes)
const REFRESH_INTERVAL_SECONDS = parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL || "300", 10);

interface UseAutoRefreshOptions {
    /** Callback when refresh succeeds */
    onSuccess?: () => void;
    /** Custom interval in seconds (overrides env config) */
    intervalSeconds?: number;
    /** Whether the hook is enabled */
    enabled?: boolean;
}

interface UseAutoRefreshReturn {
    /** Manual refresh function */
    refresh: () => Promise<void>;
    /** Seconds remaining until next auto-refresh */
    countdown: number;
    /** Whether currently refreshing */
    isRefreshing: boolean;
    /** Reset countdown (call after manual refresh) */
    resetCountdown: () => void;
}

/**
 * Custom hook for auto-refreshing data at intervals
 * - Only refreshes when page is visible
 * - Silent refresh (no loading state)
 * - Uses Page Visibility API
 * - Provides countdown timer
 */
export function useAutoRefresh<T>(
    fetchFn: () => Promise<T>,
    options: UseAutoRefreshOptions = {}
): UseAutoRefreshReturn {
    const {
        onSuccess,
        intervalSeconds = REFRESH_INTERVAL_SECONDS,
        enabled = true
    } = options;

    const [countdown, setCountdown] = useState(intervalSeconds);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isVisibleRef = useRef(true);

    // Reset countdown to initial value
    const resetCountdown = useCallback(() => {
        setCountdown(intervalSeconds);
    }, [intervalSeconds]);

    // Wrapped fetch function for silent refresh
    const silentRefresh = useCallback(async () => {
        // Only refresh if page is visible and not already refreshing
        if (!isVisibleRef.current || isRefreshing) return;

        setIsRefreshing(true);
        try {
            await fetchFn();
            onSuccess?.();
            resetCountdown(); // Reset countdown after successful refresh
        } catch (error) {
            console.error("Auto-refresh failed:", error);
            // Silently fail - don't show error to user for background refresh
        } finally {
            setIsRefreshing(false);
        }
    }, [fetchFn, onSuccess, isRefreshing, resetCountdown]);

    // Set up countdown timer
    useEffect(() => {
        if (!enabled) return;

        // Countdown timer (every second)
        intervalRef.current = setInterval(() => {
            if (!isVisibleRef.current) return; // Pause countdown when not visible

            setCountdown((prev) => {
                if (prev <= 1) {
                    // Time to refresh
                    silentRefresh();
                    return intervalSeconds; // Reset countdown
                }
                return prev - 1;
            });
        }, 1000);

        // Handle visibility change
        const handleVisibilityChange = () => {
            const wasVisible = isVisibleRef.current;
            isVisibleRef.current = document.visibilityState === "visible";

            // If becoming visible after being hidden, don't immediately refresh
            // Just continue the countdown
        };

        // Set up visibility listener
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [enabled, intervalSeconds, silentRefresh]);

    // Manual refresh function
    const refresh = useCallback(async () => {
        await silentRefresh();
    }, [silentRefresh]);

    return { refresh, countdown, isRefreshing, resetCountdown };
}
