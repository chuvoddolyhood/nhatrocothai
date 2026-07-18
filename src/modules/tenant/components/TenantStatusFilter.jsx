import { useState, useEffect, useRef } from 'react';
import { STATUS_FILTERS } from '../../../supabase/caseUtils';

export function TenantStatusFilter({ value, onChange, headerTop = 90, collapsedTop = 8 }) {
    const [headerVisible, setHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);

    // Scroll sync with Header
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

    const selectedIndex = STATUS_FILTERS.findIndex(f => f.value === value);
    const activeFilter = STATUS_FILTERS[selectedIndex] ?? STATUS_FILTERS[0];

    return (
        <div
            className="flex justify-center fixed left-0 right-0 z-30 py-2 px-4 transition-all duration-300 ease-in-out"
            style={{
                top: headerVisible ? `${headerTop}px` : `${collapsedTop}px`,
            }}
        >
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
                <div
                    style={{
                        position: 'absolute',
                        top: '3px',
                        bottom: '3px',
                        width: `calc((100% - 6px) / ${STATUS_FILTERS.length})`,
                        left: `calc(3px + ${selectedIndex} * (100% - 6px) / ${STATUS_FILTERS.length})`,
                        backgroundColor: activeFilter.bg,
                        borderRadius: '9px',
                        boxShadow: `0 2px 10px ${activeFilter.shadow}`,
                        transition: 'left 0.28s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.28s ease, box-shadow 0.28s ease',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />

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
