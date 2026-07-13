import React, { useState, useEffect } from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { InvoiceStatus, InvoiceStatusLabel } from '../constants/InvoiceStatus';

const filters = [
    { value: '', label: 'Tất cả' },
    { value: InvoiceStatus.UNPAID, label: InvoiceStatusLabel.UNPAID },
    { value: InvoiceStatus.PAID, label: InvoiceStatusLabel.PAID },
    { value: 'OVERDUE', label: 'Quá hạn' },
];

export function InvoiceStatusFilter({ value, onChange }) {
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            setIsScrolled(currentScrollY > 10);

            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                setIsHeaderVisible(false);
            } else if (currentScrollY < lastScrollY) {
                setIsHeaderVisible(true);
            }

            if (currentScrollY <= 10) {
                setIsHeaderVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <div
            className={`sticky z-30 transition-all duration-300 ease-in-out py-2 px-4 -mx-4 mb-4 ${isHeaderVisible ? 'top-21.25' : 'top-0'
                } ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-indigo-100/50' : 'bg-transparent'
                }`}
        >
            <div className="overflow-x-auto pb-1">
                <ToggleButtonGroup
                    value={value}
                    exclusive
                    onChange={onChange}
                    size="small"
                    sx={{
                        flexWrap: 'nowrap',
                        gap: 0.5,
                        '& .MuiToggleButton-root': {
                            borderRadius: '20px !important',
                            border: '1px solid #e5e7eb !important',
                            px: 2,
                            py: 0.75,
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            textTransform: 'none',
                            whiteSpace: 'nowrap',
                            color: '#6b7280',
                        },
                    }}
                >
                    {filters.map(f => {
                        let bgGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                        let hoverGradient = 'linear-gradient(135deg, #5568d3 0%, #65408a 100%)';

                        if (f.value === InvoiceStatus.PAID) {
                            bgGradient = 'linear-gradient(135deg, #34d399 0%, #14b8a6 100%)'; // emerald to teal
                            hoverGradient = 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)';
                        } else if (f.value === InvoiceStatus.UNPAID) {
                            bgGradient = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'; // amber
                            hoverGradient = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                        } else if (f.value === 'OVERDUE') {
                            bgGradient = 'linear-gradient(135deg, #ef4444 0%, #e11d48 100%)'; // red to rose
                            hoverGradient = 'linear-gradient(135deg, #dc2626 0%, #be123c 100%)';
                        }

                        return (
                            <ToggleButton
                                key={f.value}
                                value={f.value}
                                sx={{
                                    '&.Mui-selected': {
                                        background: bgGradient,
                                        color: 'white',
                                        borderColor: 'transparent !important',
                                        '&:hover': {
                                            background: hoverGradient,
                                        },
                                    }
                                }}
                            >
                                {f.label}
                            </ToggleButton>
                        );
                    })}
                </ToggleButtonGroup>
            </div>
        </div>
    );
}
