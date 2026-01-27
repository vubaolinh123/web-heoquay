"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Package, RefreshCw, AlertCircle, Building2 } from "lucide-react";
import MobileLayout, { FilterOption } from "@/components/MobileLayout";
import { DateCard } from "@/components/GomHang";
import Toast from "@/components/Toast";
import { collectOrdersApi, CollectOrderDay } from "@/lib/api";
import { useAutoRefresh } from "@/hooks";
import { useOrders } from "@/contexts";
import styles from "./page.module.css";

export default function GomHangPage() {
    const [data, setData] = useState<CollectOrderDay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<string>("");

    // Get branch options from orders context
    const { orders: ordersData } = useOrders();

    // Generate branch options from orders data
    const branchOptions = useMemo<FilterOption[]>(() => {
        const uniqueBranches = new Set<string>();

        ordersData.forEach((order) => {
            if (order.chiNhanh) {
                uniqueBranches.add(order.chiNhanh);
            }
        });

        const sorted = Array.from(uniqueBranches).sort();
        return [
            { value: "", label: "Tất cả chi nhánh" },
            ...sorted.map((branch) => ({ value: branch, label: branch })),
        ];
    }, [ordersData]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await collectOrdersApi.getAll();
            setData(result);
        } catch (err) {
            console.error("Failed to fetch collect orders:", err);
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Silent refresh (no loading state)
    const silentRefresh = useCallback(async () => {
        try {
            const result = await collectOrdersApi.getAll();
            setData(result);
        } catch (err) {
            console.error("Silent refresh failed:", err);
        }
    }, []);

    // Auto-refresh hook
    const { countdown, resetCountdown } = useAutoRefresh(silentRefresh, {
        onSuccess: () => setShowToast(true),
        enabled: !isLoading,
    });

    // Manual refresh handler
    const handleManualRefresh = async () => {
        await silentRefresh();
        resetCountdown();
        setShowToast(true);
    };

    // Clear filters handler
    const handleClearFilters = () => {
        setSelectedBranch("");
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter data by branch if chiNhanh field is available
    const filteredData = useMemo(() => {
        if (!selectedBranch) return data;
        // If the API returns branch info, filter by it
        // Since collect orders may not have branch info per day,
        // we just pass the filter through - the API should handle it in future
        return data.filter((day) => {
            // If chiNhanh is present on day level, filter
            if (day.chiNhanh) {
                return day.chiNhanh === selectedBranch;
            }
            // Otherwise, show all (API doesn't support branch filtering yet)
            return true;
        });
    }, [data, selectedBranch]);

    // Calculate total stats
    const totalDays = filteredData.length;
    const totalItems = filteredData.reduce((sum, day) =>
        sum + day.danhSachHang.reduce((daySum, item) => daySum + item.tongSoLuong, 0), 0
    );

    return (
        <MobileLayout
            onRefresh={handleManualRefresh}
            refreshCountdown={countdown}
            selectedBranch={selectedBranch}
            onBranchChange={setSelectedBranch}
            branchOptions={branchOptions}
            onClearFilters={handleClearFilters}
        >
            <div className={styles.container}>
                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.headerInfo}>
                        <h1 className={styles.pageTitle}>
                            <Package size={24} />
                            Gom Hàng
                        </h1>
                        <p className={styles.subtitle}>
                            Tổng hợp sản phẩm theo ngày giao
                            {selectedBranch && (
                                <span className={styles.branchBadge}>
                                    <Building2 size={14} />
                                    {selectedBranch}
                                </span>
                            )}
                        </p>
                    </div>
                    <button
                        className={styles.refreshBtn}
                        onClick={handleManualRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw size={18} className={isLoading ? styles.spinning : ""} />
                    </button>
                </div>

                {/* Stats Summary */}
                {!isLoading && !error && filteredData.length > 0 && (
                    <div className={styles.summary}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryValue}>{totalDays}</span>
                            <span className={styles.summaryLabel}>Ngày giao</span>
                        </div>
                        <div className={styles.summaryDivider}></div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryValue}>{totalItems}</span>
                            <span className={styles.summaryLabel}>Tổng sản phẩm</span>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className={styles.loadingGrid}>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={styles.skeleton}>
                                <div className={styles.skeletonHeader}></div>
                                <div className={styles.skeletonBody}>
                                    <div className={styles.skeletonLine}></div>
                                    <div className={styles.skeletonLine}></div>
                                    <div className={styles.skeletonLine}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className={styles.error}>
                        <AlertCircle size={48} />
                        <h3>Không thể tải dữ liệu</h3>
                        <p>{error}</p>
                        <button onClick={fetchData} className={styles.retryBtn}>
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && filteredData.length === 0 && (
                    <div className={styles.empty}>
                        <Package size={64} />
                        <h3>Chưa có đơn hàng gom</h3>
                        <p>
                            {selectedBranch
                                ? `Không có dữ liệu gom hàng cho ${selectedBranch}`
                                : "Dữ liệu gom hàng sẽ hiển thị ở đây"}
                        </p>
                    </div>
                )}

                {/* Data Grid */}
                {!isLoading && !error && filteredData.length > 0 && (
                    <div className={styles.grid}>
                        {filteredData.map((day, index) => (
                            <DateCard
                                key={`${day.ngayGiaoHang}-${index}`}
                                data={day}
                                branch={selectedBranch || day.chiNhanh}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Toast notification */}
            <Toast
                message="Đã làm mới dữ liệu gom hàng"
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />
        </MobileLayout>
    );
}
