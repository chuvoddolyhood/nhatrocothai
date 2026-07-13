import React from 'react';
import { Skeleton, Card, CardContent } from '@mui/material';

const Loading = () => {
  return (
    <div className="p-4 pb-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <Card
            key={item}
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 w-full">
                  <Skeleton variant="circular" width={40} height={40} />
                  <div className="flex-1">
                    <Skeleton variant="text" width="40%" height={28} />
                    <Skeleton variant="text" width="20%" height={20} />
                  </div>
                </div>
                <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '12px' }} />
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="text" width="80%" height={24} />
                </div>
                <div>
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="text" width="80%" height={24} />
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Skeleton variant="rounded" width="100%" height={32} sx={{ borderRadius: '8px' }} />
                <Skeleton variant="rounded" width="100%" height={32} sx={{ borderRadius: '8px' }} />
                <Skeleton variant="rounded" width="100%" height={32} sx={{ borderRadius: '8px' }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Loading;
