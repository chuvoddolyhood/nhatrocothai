import React from 'react';
import { Card } from '@mui/material';

const CardDashBoard = ({ bgGradient, icon: Icon, title, value }) => {
    return (
        <Card className="overflow-hidden" sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div className={`bg-gradient-to-br ${bgGradient} p-4 text-white h-full`}>
                <div className="flex items-center gap-2 mb-2">
                    {Icon && <Icon size={20} />}
                    <span className="text-xs opacity-90">{title}</span>
                </div>
                <p className="text-3xl">{value}</p>
            </div>
        </Card>
    );
};

export default CardDashBoard;