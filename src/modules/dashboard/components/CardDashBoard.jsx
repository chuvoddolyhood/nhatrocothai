import React from 'react';
import { Card } from '@mui/material';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * @param {string} bgGradient - Tailwind gradient class
 * @param {React.ComponentType} icon - Lucide icon
 * @param {string} title - Tiêu đề card
 * @param {string|number} value - Giá trị chính (lớn)
 * @param {{ amount: number, unit: string }} [subValue] - Giá trị phụ tăng/giảm
 */
const CardDashBoard = ({ bgGradient, icon: Icon, title, value, subValue, onClick }) => {
    const isUp = subValue?.amount > 0;
    const isDown = subValue?.amount < 0;
    const absAmount = subValue ? Math.abs(subValue.amount) : 0;

    return (
        <Card
            className="overflow-hidden"
            onClick={onClick}
            sx={{
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:active': onClick ? { transform: 'scale(0.97)' } : {},
                '&:hover': onClick ? { boxShadow: '0 6px 18px rgba(0,0,0,0.14)' } : {},
            }}
        >
            <div className={`bg-gradient-to-br ${bgGradient} p-4 text-white h-full`}>
                <div className="flex items-center gap-2 mb-2">
                    {Icon && <Icon size={20} />}
                    <span className="text-xs opacity-90">{title}</span>
                </div>
                <p className="text-2xl font-bold leading-tight">{value}</p>

                {subValue && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 6,
                        fontSize: 12,
                        opacity: 0.92,
                    }}>
                        {isUp && (
                            <TrendingUp size={14} style={{ color: '#86efac' }} />
                        )}
                        {isDown && (
                            <TrendingDown size={14} style={{ color: '#fca5a5' }} />
                        )}
                        <span style={{ color: isUp ? '#86efac' : isDown ? '#fca5a5' : 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                            {isUp ? '+' : isDown ? '-' : ''}{absAmount} {subValue.unit}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>
                            so với tháng trước
                        </span>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default CardDashBoard;