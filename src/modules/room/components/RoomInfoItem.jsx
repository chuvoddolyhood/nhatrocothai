import React from 'react'

const RoomInfoItem = ({ label, value, className = '' }) => {
    return (
        <div
            className={`p-3 bg-gray-50 rounded-xl ${className}`}
        >
            <p className="text-xs text-gray-600 mb-1">
                {label}
            </p>

            <p className="font-medium text-sm">
                {value}
            </p>
        </div>
    )
}

export default RoomInfoItem
