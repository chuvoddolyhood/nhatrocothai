import React from 'react'

const RevenueRow = ({ label, value, bgClass, textClass }) => {
    const formatCurrency = (value) => value.toLocaleString('vi-VN') + ' ₫';

    return (
        <div className={`flex justify-between items-center p-3 rounded-xl ${bgClass}`} >
            <span className={`text-sm ${textClass}`}>
                {label}:
            </span>

            <span className={`font-medium text-base ${textClass}`}>
                {formatCurrency(value)}
            </span>
        </div>
    )
}

export default RevenueRow