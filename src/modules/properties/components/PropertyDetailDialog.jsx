import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogActions, Button, Chip } from '@mui/material';
import { Building2, MapPin, Home, Calendar, Edit } from 'lucide-react';
import InfoItem from '../../../shared/components/ui/InfoItem';
import { PROPERTY_STATUS } from '../dto/PropertyDTO';
import { RoomService } from '../../room/services/RoomService';

export function PropertyDetailDialog({ open, onClose, property, onEdit }) {
    const [rooms, setRooms] = useState([]);

    const fetchPropertyRooms = useCallback(async () => {
        if (!property) return;

        try {
            const response = await RoomService.getRooms('ALL');
            if (response.success) {
                // Filter rooms by property
                const propertyRooms = response.data.filter(
                    room => room.propertyId === property.id
                );
                setRooms(propertyRooms);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    }, [property]);

    useEffect(() => {
        if (open && property) {
            fetchPropertyRooms();
        }
    }, [open, property, fetchPropertyRooms]);

    if (!property) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const calculateOccupancyRate = () => {
        if (property.roomCount === 0) return 0;
        return Math.round((property.occupiedRoomCount / property.roomCount) * 100);
    };

    const getAvailableRooms = () => {
        return rooms.filter(room => room.status === 'AVAILABLE').length;
    };

    const getMaintenanceRooms = () => {
        return rooms.filter(room => room.status === 'MAINTENANCE').length;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <div className={`bg-gradient-to-r ${PROPERTY_STATUS[property.status]?.bgGradient} p-6 text-white`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Building2 size={32} />
                        <div>
                            <h2 className="text-2xl font-bold">{property.name}</h2>
                            <Chip
                                label={PROPERTY_STATUS[property.status]?.label}
                                size="small"
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.3)',
                                    color: 'white',
                                    fontWeight: 500,
                                    mt: 1,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <DialogContent sx={{ p: 3 }}>
                <div className="flex flex-col gap-4">
                    {/* Address */}
                    {property.address && (
                        <div className="flex items-start gap-2 text-gray-700">
                            <MapPin size={20} className="mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{property.address}</p>
                        </div>
                    )}

                    {/* Room Statistics */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mt-2">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Home size={18} />
                            Thống kê phòng
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <InfoItem
                                label="Tổng số phòng"
                                value={property.roomCount || 0}
                            />
                            <InfoItem
                                label="Đang thuê"
                                value={property.occupiedRoomCount || 0}
                            />
                            <InfoItem
                                label="Phòng trống"
                                value={getAvailableRooms()}
                            />
                            <InfoItem
                                label="Đang sửa"
                                value={getMaintenanceRooms()}
                            />
                        </div>

                        {/* Occupancy Rate */}
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Tỷ lệ lấp đầy</span>
                                <span className="text-lg font-bold text-indigo-600">
                                    {calculateOccupancyRate()}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${calculateOccupancyRate()}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Calendar size={18} />
                            Thông tin khác
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <InfoItem
                                label="Ngày tạo"
                                value={formatDate(property.createdAt)}
                            />
                            <InfoItem
                                label="Cập nhật"
                                value={formatDate(property.updatedAt)}
                            />
                        </div>
                    </div>

                    {/* Room List Preview */}
                    {rooms.length > 0 && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-gray-800 mb-2">
                                Danh sách phòng ({rooms.length})
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {rooms.slice(0, 10).map((room) => (
                                    <Chip
                                        key={room.id}
                                        label={`P${room.roomId}`}
                                        size="small"
                                        color={room.status === 'OCCUPIED' ? 'primary' : 'default'}
                                    />
                                ))}
                                {rooms.length > 10 && (
                                    <Chip
                                        label={`+${rooms.length - 10} phòng`}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, gap: 1 }}>
                <Button onClick={onClose}>Đóng</Button>
                <Button
                    variant="contained"
                    startIcon={<Edit size={18} />}
                    onClick={() => {
                        onClose();
                        onEdit(property);
                    }}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #65408a 100%)',
                        },
                    }}
                >
                    Sửa thông tin
                </Button>
            </DialogActions>
        </Dialog>
    );
}

PropertyDetailDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    property: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        address: PropTypes.string,
        status: PropTypes.string,
        roomCount: PropTypes.number,
        occupiedRoomCount: PropTypes.number,
        createdAt: PropTypes.string,
        updatedAt: PropTypes.string,
    }),
    onEdit: PropTypes.func.isRequired,
};
