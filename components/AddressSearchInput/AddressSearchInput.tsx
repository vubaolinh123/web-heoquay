"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, X, Loader2, Search } from "lucide-react";
import { searchAhamoveAddress, AddressResult } from "@/lib/api";
import styles from "./AddressSearchInput.module.css";

interface AddressSearchInputProps {
    value: string;
    onChange: (address: string, result?: AddressResult) => void;
    placeholder?: string;
    disabled?: boolean;
}

export default function AddressSearchInput({
    value,
    onChange,
    placeholder = "Nhập địa chỉ giao hàng...",
    disabled = false,
}: AddressSearchInputProps) {
    const [inputValue, setInputValue] = useState(value);
    const [results, setResults] = useState<AddressResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Sync input with external value
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced search
    const handleSearch = useCallback(async (query: string) => {
        if (query.trim().length < 2) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        setIsLoading(true);
        try {
            const data = await searchAhamoveAddress(query);
            setResults(data);
            setShowDropdown(data.length > 0);
        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle input change with debounce
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Clear previous debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Debounce search
        debounceRef.current = setTimeout(() => {
            handleSearch(newValue);
        }, 300);
    };

    // Handle result selection
    const handleSelectResult = (result: AddressResult) => {
        const fullAddress = result.address || result.shortAddress || "";
        setInputValue(fullAddress);
        onChange(fullAddress, result);
        setShowDropdown(false);
        setResults([]);
    };

    // Clear input
    const handleClear = () => {
        setInputValue("");
        onChange("");
        setResults([]);
        setShowDropdown(false);
    };

    // Highlight search text in result
    const highlightText = (text: string) => {
        if (!inputValue.trim()) return text;

        const regex = new RegExp(`(${inputValue.trim()})`, "gi");
        const parts = text.split(regex);

        return parts.map((part, i) =>
            regex.test(part) ? (
                <span key={i} className={styles.highlight}>{part}</span>
            ) : (
                part
            )
        );
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                    <MapPin size={18} />
                </div>
                <input
                    type="text"
                    className={styles.input}
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => results.length > 0 && setShowDropdown(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                />
                <div className={styles.inputActions}>
                    {isLoading && (
                        <Loader2 size={16} className={styles.loadingIcon} />
                    )}
                    {inputValue && !isLoading && (
                        <button
                            type="button"
                            className={styles.clearBtn}
                            onClick={handleClear}
                            aria-label="Xóa"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Dropdown Results */}
            {showDropdown && results.length > 0 && (
                <div className={styles.dropdown}>
                    {results.map((result, index) => (
                        <button
                            key={result.id || index}
                            type="button"
                            className={styles.resultItem}
                            onClick={() => handleSelectResult(result)}
                        >
                            <div className={styles.resultIcon}>
                                <MapPin size={16} />
                            </div>
                            <div className={styles.resultContent}>
                                <div className={styles.resultShort}>
                                    {highlightText(result.shortAddress || result.address.split(",")[0])}
                                </div>
                                <div className={styles.resultFull}>
                                    {result.address}
                                </div>
                            </div>
                        </button>
                    ))}

                    {/* Show more link */}
                    <div className={styles.showMore}>
                        <Search size={16} />
                        <span>Hiển thị thêm kết quả: &quot;{inputValue}&quot;</span>
                    </div>
                </div>
            )}
        </div>
    );
}
