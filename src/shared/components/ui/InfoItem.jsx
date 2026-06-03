import React from 'react'

const InfoItem = ({ label, value, icon, className = '' }) => {
    return (
        <div className={`p-3 bg-gray-50 rounded-xl ${icon ? 'flex items-center gap-3' : ''} ${className}`}>
            {icon && icon}
            <div>
                <p className={`text-xs text-gray-600 ${icon ? '' : 'mb-1'}`}>
                    {label}
                </p>

                <p className="font-medium text-sm">
                    {value}
                </p>
            </div>
        </div>
    )
}

export default InfoItem
