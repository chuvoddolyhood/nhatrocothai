import React from 'react'

const ProgressBarDashboard = ({ label, value, total, gradient }) => {
    const percent = total > 0 ? (value / total) * 100 : 0;

    return (
        <div>
            <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium">
                    {value}/{total} phòng
                </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`${gradient} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

export default ProgressBarDashboard