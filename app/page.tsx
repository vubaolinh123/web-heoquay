"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import MobileLayout, { FilterStatus, FilterOption } from "@/components/MobileLayout";
import DailyHeader from "@/components/DailyHeader";
import OrderCard from "@/components/OrderCard";
import OrderDetailModal from "@/components/OrderDetailModal";
import StickyDayHeader from "@/components/StickyDayHeader";
import { KitchenSlipModal, ReportModal } from "@/components/Print";
import Toast from "@/components/Toast";
import { ordersApi, transformApiOrder, groupOrdersByDate } from "@/lib/api";
import { useAutoRefresh } from "@/hooks";
import { formatTien } from "@/lib/mockData";
import { DonHang, DonHangTheoNgay } from "@/lib/types";
import styles from "./page.module.css";

export default function HomePage() {
  const searchParams = useSearchParams();

  const [selectedOrder, setSelectedOrder] = useState<DonHang | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentVisibleDay, setCurrentVisibleDay] = useState<DonHangTheoNgay | null>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  // API State
  const [allOrdersGroupedByDay, setAllOrdersGroupedByDay] = useState<DonHangTheoNgay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Toast state for auto-refresh notification
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date and Branch filter state - initialize from URL query
  const [selectedDate, setSelectedDate] = useState(() => searchParams.get("date") || "");
  const [selectedBranch, setSelectedBranch] = useState("");

  // Sync selectedDate when URL changes
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam !== null) {
      setSelectedDate(dateParam);
    }
  }, [searchParams]);

  // Print modal state
  const [printModalData, setPrintModalData] = useState<{
    type: "kitchen" | "report" | null;
    date: Date;
    lunarDate: string;
    orders: DonHang[];
  } | null>(null);

  const daySectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apiOrders = await ordersApi.getOrders();
      const transformedOrders = apiOrders.map(transformApiOrder);
      const groupedOrders = groupOrdersByDate(transformedOrders);
      setAllOrdersGroupedByDay(groupedOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải đơn hàng");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Silent refresh for auto-refresh (no loading state)
  const silentRefresh = useCallback(async () => {
    try {
      const apiOrders = await ordersApi.getOrders();
      const transformedOrders = apiOrders.map(transformApiOrder);
      const groupedOrders = groupOrdersByDate(transformedOrders);
      setAllOrdersGroupedByDay(groupedOrders);
    } catch (err) {
      console.error("Silent refresh failed:", err);
      // Don't show error for background refresh
    }
  }, []);

  // Auto-refresh hook - refresh every 5 minutes (configurable)
  const { countdown, resetCountdown } = useAutoRefresh(silentRefresh, {
    onSuccess: () => setShowToast(true),
    enabled: !isLoading, // Only enable after initial load
  });

  // Manual refresh handler (for header button)
  const handleManualRefresh = useCallback(async () => {
    await silentRefresh();
    resetCountdown();
    setShowToast(true);
  }, [silentRefresh, resetCountdown]);

  // Initial data fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter and search logic
  const filteredData = useMemo(() => {
    return allOrdersGroupedByDay.map((day) => {
      let filteredOrders = day.donHangs;

      // Apply status filter
      if (activeFilter === "pending") {
        filteredOrders = filteredOrders.filter((d) => d.trangThai === "chua_giao");
      } else if (activeFilter === "delivered") {
        filteredOrders = filteredOrders.filter((d) => d.trangThai === "da_giao");
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredOrders = filteredOrders.filter(
          (d) =>
            d.khachHang.ten.toLowerCase().includes(query) ||
            d.khachHang.soDienThoai.includes(query)
        );
      }

      // Apply date filter
      if (selectedDate) {
        const filterDateStr = selectedDate;
        filteredOrders = filteredOrders.filter((d) => {
          const orderDateStr = d.ngay.toISOString().split("T")[0];
          return orderDateStr === filterDateStr;
        });
      }

      // Apply branch filter
      if (selectedBranch) {
        filteredOrders = filteredOrders.filter(
          (d) => d.chiNhanh === selectedBranch
        );
      }

      return {
        ...day,
        donHangs: filteredOrders,
        tongDon: filteredOrders.length,
        tongDoanhThu: filteredOrders.reduce((sum, d) => sum + d.tongTien, 0),
      };
    }).filter((day) => day.donHangs.length > 0);
  }, [allOrdersGroupedByDay, activeFilter, searchQuery, selectedDate, selectedBranch]);

  // Calculate order counts for tabs
  const orderCounts = useMemo(() => {
    const allOrders = allOrdersGroupedByDay.flatMap((d) => d.donHangs);
    return {
      all: allOrders.length,
      pending: allOrders.filter((d) => d.trangThai === "chua_giao").length,
      delivered: allOrders.filter((d) => d.trangThai === "da_giao").length,
    };
  }, [allOrdersGroupedByDay]);

  // Generate dynamic date options from API data
  const dateOptions = useMemo<FilterOption[]>(() => {
    const allOrders = allOrdersGroupedByDay.flatMap((d) => d.donHangs);
    const uniqueDates = new Set<string>();

    allOrders.forEach((order) => {
      const dateStr = order.ngay.toISOString().split("T")[0];
      uniqueDates.add(dateStr);
    });

    const sortedDates = Array.from(uniqueDates).sort((a, b) => b.localeCompare(a)); // Newest first

    const options: FilterOption[] = [{ value: "", label: "Ngày giao hàng" }];
    sortedDates.forEach((dateStr) => {
      const date = new Date(dateStr);
      const label = date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      options.push({ value: dateStr, label });
    });

    return options;
  }, [allOrdersGroupedByDay]);

  // Generate dynamic branch options from API data
  const branchOptions = useMemo<FilterOption[]>(() => {
    const allOrders = allOrdersGroupedByDay.flatMap((d) => d.donHangs);
    const uniqueBranches = new Set<string>();

    allOrders.forEach((order) => {
      if (order.chiNhanh) {
        uniqueBranches.add(order.chiNhanh);
      }
    });

    const sortedBranches = Array.from(uniqueBranches).sort();

    const options: FilterOption[] = [{ value: "", label: "Chi nhánh" }];
    sortedBranches.forEach((branch) => {
      options.push({ value: branch, label: branch });
    });

    return options;
  }, [allOrdersGroupedByDay]);

  // Setup IntersectionObserver for sticky header
  const setDaySectionRef = useCallback((dateKey: string, element: HTMLDivElement | null) => {
    if (element) {
      daySectionRefs.current.set(dateKey, element);
    } else {
      daySectionRefs.current.delete(dateKey);
    }
  }, []);

  useEffect(() => {
    // Initialize with first day if available
    if (filteredData.length > 0 && !currentVisibleDay) {
      setCurrentVisibleDay(filteredData[0]);
    }
  }, [filteredData, currentVisibleDay]);

  useEffect(() => {
    const headerHeight = 100;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find entries that are intersecting and get the one closest to top
        const intersectingEntries = entries.filter((e) => e.isIntersecting);

        if (intersectingEntries.length > 0) {
          // Sort by boundingClientRect.top to find the topmost visible section
          intersectingEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );

          const topmostEntry = intersectingEntries[0];
          const target = topmostEntry.target as HTMLElement;
          const dateKey = target.dataset.date;

          if (dateKey) {
            const dayData = filteredData.find(
              (d) => d.ngay.toISOString().split("T")[0] === dateKey
            );

            if (dayData) {
              setCurrentVisibleDay(dayData);
            }
          }
        }
      },
      {
        root: null,
        rootMargin: `-${headerHeight}px 0px 0px 0px`,
        threshold: [0, 0.1, 0.5, 1],
      }
    );

    // Observe all day sections
    daySectionRefs.current.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [filteredData]);

  // Handle scroll for sticky header visibility - show when scrolled past first header
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Show sticky header when we've scrolled past the main header
      setShowStickyHeader(scrollY > 120);
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePrintKitchen = () => {
    if (!selectedOrder) return;
    window.print();
    alert("Đang in phiếu bếp cho đơn #" + selectedOrder.maDon);
  };

  const handlePrintInvoice = () => {
    if (!selectedOrder) return;
    window.print();
    alert("Đang xuất hóa đơn cho đơn #" + selectedOrder.maDon);
  };

  const handlePrintDaily = (day: DonHangTheoNgay) => {
    setPrintModalData({
      type: "kitchen",
      date: day.ngay,
      lunarDate: day.ngayAm,
      orders: day.donHangs,
    });
  };

  const handleExportDaily = (day: DonHangTheoNgay) => {
    setPrintModalData({
      type: "report",
      date: day.ngay,
      lunarDate: day.ngayAm,
      orders: day.donHangs,
    });
  };

  const closePrintModal = () => {
    setPrintModalData(null);
  };

  // Clear date and branch filters
  const handleClearFilters = useCallback(() => {
    setSelectedDate("");
    setSelectedBranch("");
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <MobileLayout
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        orderCounts={{ all: 0, pending: 0, delivered: 0 }}
      >
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Đang tải đơn hàng...</p>
        </div>
      </MobileLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MobileLayout
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        orderCounts={{ all: 0, pending: 0, delivered: 0 }}
      >
        <div className={styles.errorState}>
          <p className={styles.errorMessage}>⚠️ {error}</p>
          <button className={styles.retryButton} onClick={fetchOrders}>
            Thử lại
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      orderCounts={orderCounts}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      selectedBranch={selectedBranch}
      onBranchChange={setSelectedBranch}
      dateOptions={dateOptions}
      branchOptions={branchOptions}
      onClearFilters={handleClearFilters}
      onRefresh={handleManualRefresh}
      refreshCountdown={countdown}
    >
      {/* Sticky Day Header */}
      {currentVisibleDay && (
        <StickyDayHeader
          thuTrongTuan={currentVisibleDay.thuTrongTuan}
          ngay={currentVisibleDay.ngay}
          ngayAm={currentVisibleDay.ngayAm}
          tongDon={currentVisibleDay.tongDon}
          tongDoanhThu={currentVisibleDay.tongDoanhThu}
          isVisible={showStickyHeader}
          onPrint={() => handlePrintDaily(currentVisibleDay)}
          onExport={() => handleExportDaily(currentVisibleDay)}
        />
      )}

      {/* Spacer for fixed sticky header */}
      {showStickyHeader && <div className={styles.stickyHeaderSpacer} />}

      <div className={styles.orderList}>
        {filteredData.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Không tìm thấy đơn hàng nào</p>
            {searchQuery && (
              <button
                className={styles.clearSearchButton}
                onClick={() => setSearchQuery("")}
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        ) : (
          filteredData.map((day) => {
            const dateKey = day.ngay.toISOString().split("T")[0];
            return (
              <div
                key={dateKey}
                className={styles.daySection}
                ref={(el) => setDaySectionRef(dateKey, el)}
                data-date={dateKey}
              >
                <DailyHeader
                  thuTrongTuan={day.thuTrongTuan}
                  ngay={day.ngay}
                  ngayAm={day.ngayAm}
                  tongDon={day.tongDon}
                  tongDoanhThu={day.tongDoanhThu}
                  onPrint={() => handlePrintDaily(day)}
                  onExport={() => handleExportDaily(day)}
                />
                <div className={styles.orders}>
                  {day.donHangs.map((donHang) => (
                    <OrderCard
                      key={donHang.id}
                      donHang={donHang}
                      onClick={() => setSelectedOrder(donHang)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          donHang={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPrintKitchen={handlePrintKitchen}
          onPrintInvoice={handlePrintInvoice}
        />
      )}

      {/* Print Modals */}
      {printModalData?.type === "kitchen" && (
        <KitchenSlipModal
          isOpen={true}
          onClose={closePrintModal}
          date={printModalData.date}
          lunarDate={printModalData.lunarDate}
          orders={printModalData.orders}
        />
      )}
      {printModalData?.type === "report" && (
        <ReportModal
          isOpen={true}
          onClose={closePrintModal}
          date={printModalData.date}
          orders={printModalData.orders}
        />
      )}

      {/* Toast notification for auto-refresh */}
      <Toast
        message="Đã làm mới đơn hàng"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </MobileLayout>
  );
}
