import { useState, useEffect, useRef } from 'react';
import { ContractStatus, ContractStatusLabel } from '../constants/ContractStatus';

// Cấu hình màu cho từng trạng thái
const STATUS_FILTERS = [
    {
        value: ContractStatus.ACTIVE,
        label: ContractStatusLabel.ACTIVE,
        bg: '#10b981',
        shadow: 'rgba(16,185,129,0.40)',
    },
    {
        value: ContractStatus.EXPIRED,
        label: ContractStatusLabel.EXPIRED,
        bg: '#f59e0b',
        shadow: 'rgba(245,158,11,0.40)',
    },
    {
        value: ContractStatus.TERMINATED,
        label: ContractStatusLabel.TERMINATED,
        bg: '#f43f5e',
        shadow: 'rgba(244,63,94,0.40)',
    },
];

/**
 * Filter pill với indicator trượt mượt mà khi chuyển tab.
 * Đồng bộ vị trí với Header.jsx (ẩn/hiện theo scroll).
 */
export function ContractStatusFilter({ value, onChange, headerTop = 90, collapsedTop = 8 }) {
    const [headerVisible, setHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);

    // --- Scroll sync với Header ---
    useEffect(() => {
        const THRESHOLD = 80;
        const onScroll = () => {
            const currentY = window.scrollY;
            if (currentY > lastScrollY.current && currentY > THRESHOLD) {
                setHeaderVisible(false);
            } else if (currentY < lastScrollY.current) {
                setHeaderVisible(true);
            }
            if (currentY <= 10) setHeaderVisible(true);
            lastScrollY.current = currentY;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // --- Tính vị trí indicator ---
    const selectedIndex = STATUS_FILTERS.findIndex(f => f.value === value);
    const activeFilter = STATUS_FILTERS[selectedIndex] ?? STATUS_FILTERS[0];
    const pct = 100 / STATUS_FILTERS.length;

    return (
        <div
            className="flex justify-center fixed left-0 right-0 z-30 py-2 px-4 transition-all duration-300 ease-in-out"
            style={{
                top: headerVisible ? `${headerTop}px` : `${collapsedTop}px`,
                WebkitBackdropFilter: 'blur(14px)',
            }}
        >
            {/* Pill container */}
            <div
                style={{
                    position: 'relative',
                    display: 'flex',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '3px',
                    gap: 0,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
                    userSelect: 'none',
                }}
            >
                {/* Sliding indicator */}
                <div
                    style={{
                        position: 'absolute',
                        top: '3px',
                        bottom: '3px',
                        width: `calc(${pct}% - 3px)`,
                        left: `calc(${selectedIndex * pct}% + 3px)`,
                        backgroundColor: activeFilter.bg,
                        borderRadius: '9px',
                        boxShadow: `0 2px 10px ${activeFilter.shadow}`,
                        transition: 'left 0.28s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.28s ease, box-shadow 0.28s ease',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />

                {/* Buttons */}
                {STATUS_FILTERS.map((f, i) => {
                    const isSelected = f.value === value;
                    return (
                        <button
                            key={f.value}
                            onClick={() => onChange(null, f.value)}
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                flex: 1,
                                minWidth: '76px',
                                padding: '6px 16px',
                                fontSize: '0.78rem',
                                fontWeight: isSelected ? 600 : 500,
                                color: isSelected ? 'white' : '#6b7280',
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderRadius: '9px',
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'color 0.22s ease, font-weight 0.1s',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {f.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
