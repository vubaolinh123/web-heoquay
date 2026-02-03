"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Package, RefreshCw, AlertCircle, Building2 } from "lucide-react";
import MobileLayout, { FilterOption } from "@/components/MobileLayout";
import { DateCard } from "@/components/GomHang";
import Toast from "@/components/Toast";
import { collectOrdersApi, CollectOrderRawItem, groupCollectOrdersByDate } from "@/lib/api";
import { useAutoRefresh } from "@/hooks";
import styles from "./page.module.css";

export default function GomHangPage() {
    // Store raw items from API
    const [rawItems, setRawItems] = useState<CollectOrderRawItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<string>("");

    // Fetch raw items from API
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const items = await collectOrdersApi.getRawItems();
            setRawItems(items);
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
            const items = await collectOrdersApi.getRawItems();
            setRawItems(items);
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

    // Generate branch options from raw items
    const branchOptions = useMemo<FilterOption[]>(() => {
        const uniqueBranches = new Set<string>();

        rawItems.forEach((item) => {
            if (item.chiNhanh) {
                uniqueBranches.add(item.chiNhanh);
            }
        });

        const sorted = Array.from(uniqueBranches).sort();
        return [
            { value: "", label: "Tất cả chi nhánh" },
            ...sorted.map((branch) => ({ value: branch, label: branch })),
        ];
    }, [rawItems]);

    // Group data based on branch filter (client-side grouping)
    const groupedData = useMemo(() => {
        return groupCollectOrdersByDate(rawItems, selectedBranch || undefined);
    }, [rawItems, selectedBranch]);


    // Calculate total stats
    const totalDays = groupedData.length;
    const totalItems = groupedData.reduce((sum, day) =>
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
                {!isLoading && !error && groupedData.length > 0 && (
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
                {!isLoading && !error && groupedData.length === 0 && (
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
                {!isLoading && !error && groupedData.length > 0 && (
                    <div className={styles.grid}>
                        {groupedData.map((day, index) => (
                            <DateCard
                                key={`${day.ngayGiaoHang}-${index}`}
                                data={day}
                                branch={selectedBranch || undefined}
                                rawItems={rawItems}
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
