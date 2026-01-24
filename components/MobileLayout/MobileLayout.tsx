"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ClipboardList,
    Calendar,
    Package,
    Warehouse,
    Search,
    RefreshCw,
    X,
    ChevronDown,
} from "lucide-react";
import styles from "./MobileLayout.module.css";

export type FilterStatus = "all" | "pending" | "delivered";

interface MobileLayoutProps {
    children: ReactNode;
    activeFilter?: FilterStatus;
    onFilterChange?: (filter: FilterStatus) => void;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    orderCounts?: {
        all: number;
        pending: number;
        delivered: number;
    };
    selectedDate?: string;
    onDateChange?: (date: string) => void;
    selectedBranch?: string;
    onBranchChange?: (branch: string) => void;
}

const navItems = [
    { href: "/", label: "Đơn hàng", icon: ClipboardList },
    { href: "/lich", label: "Lịch", icon: Calendar },
    { href: "/gom-hang", label: "Gom hàng", icon: Package },
    { href: "/kho", label: "Kho", icon: Warehouse },
];

const filterTabs: { id: FilterStatus; label: string }[] = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chưa giao" },
    { id: "delivered", label: "Đã giao" },
];

// Mock data for dropdown options
const dateOptions = [
    { value: "", label: "Ngày giao hàng" },
    { value: "2026-01-22", label: "22/01/2026" },
    { value: "2026-01-23", label: "23/01/2026" },
    { value: "2026-01-24", label: "24/01/2026" },
    { value: "2026-01-25", label: "25/01/2026" },
];

const branchOptions = [
    { value: "", label: "Chi nhánh" },
    { value: "cn1", label: "Chi Nhánh 1" },
    { value: "cn2", label: "Chi Nhánh 2" },
    { value: "cn3", label: "Chi Nhánh 3" },
];

export default function MobileLayout({
    children,
    activeFilter = "all",
    onFilterChange,
    searchQuery = "",
    onSearchChange,
    orderCounts = { all: 0, pending: 0, delivered: 0 },
    selectedDate = "",
    onDateChange,
    selectedBranch = "",
    onBranchChange,
}: MobileLayoutProps) {
    const pathname = usePathname();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleFilterClick = (filter: FilterStatus) => {
        onFilterChange?.(filter);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        if (isSearchOpen) {
            onSearchChange?.("");
        }
    };

    const getTabCount = (tabId: FilterStatus) => {
        return orderCounts[tabId];
    };

    return (
        <div className={styles.layout}>
            {/* Sidebar for Desktop */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarLogo}>
                    <img
                        src="/logo.png"
                        alt="Ngọc Hải"
                        className={styles.sidebarLogoImg}
                    />
                    <span className={styles.sidebarLogoText}>Ngọc Hải</span>
                </div>
                <nav className={styles.sidebarNav}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.sidebarNavItem} ${isActive ? styles.sidebarNavItemActive : ""
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Content Wrapper */}
            <div className={styles.contentWrapper}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerTop}>
                        <img src="/logo.png" alt="Ngọc Hải" className={styles.logo} />
                        <h1 className={styles.headerTitle}>Đơn hàng</h1>

                        {/* Search Bar - Desktop always visible */}
                        <form
                            className={`${styles.searchContainer} ${isSearchOpen ? styles.searchOpen : ""
                                }`}
                            onSubmit={handleSearchSubmit}
                        >
                            <Search size={18} className={styles.searchIcon} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Tìm theo tên, SĐT..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                            />
                        </form>

                        <div className={styles.headerActions}>
                            {/* Mobile search toggle */}
                            <button
                                className={styles.iconButton}
                                aria-label={isSearchOpen ? "Đóng tìm kiếm" : "Tìm kiếm"}
                                onClick={toggleSearch}
                            >
                                {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                            </button>
                            <button className={styles.iconButton} aria-label="Làm mới">
                                <RefreshCw size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search - Expandable */}
                    {isSearchOpen && (
                        <div className={styles.mobileSearchRow}>
                            <form
                                className={styles.mobileSearchForm}
                                onSubmit={handleSearchSubmit}
                            >
                                <Search size={18} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="Tìm theo tên, SĐT..."
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange?.(e.target.value)}
                                    autoFocus
                                />
                            </form>
                        </div>
                    )}

                    {/* Filter Row */}
                    <div className={styles.filterRow}>
                        {/* Status Filter Tabs */}
                        <nav className={styles.navTabs}>
                            {filterTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`${styles.navTab} ${activeFilter === tab.id ? styles.navTabActive : ""
                                        }`}
                                    onClick={() => handleFilterClick(tab.id)}
                                >
                                    {tab.label}
                                    <span className={styles.tabCount}>{getTabCount(tab.id)}</span>
                                </button>
                            ))}
                        </nav>

                        {/* Dropdown Filters */}
                        <div className={styles.dropdownFilters}>
                            <div className={styles.dropdown}>
                                <select
                                    className={styles.dropdownSelect}
                                    value={selectedDate}
                                    onChange={(e) => onDateChange?.(e.target.value)}
                                >
                                    {dateOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className={styles.dropdownIcon} />
                            </div>

                            <div className={styles.dropdown}>
                                <select
                                    className={styles.dropdownSelect}
                                    value={selectedBranch}
                                    onChange={(e) => onBranchChange?.(e.target.value)}
                                >
                                    {branchOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className={styles.dropdownIcon} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className={styles.main}>{children}</main>
            </div>

            {/* Bottom Navigation - Mobile/Tablet only */}
            <nav className={styles.bottomNav}>
                <ul className={styles.bottomNavList}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ""
                                        }`}
                                >
                                    <Icon size={24} className={styles.bottomNavIcon} />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}
