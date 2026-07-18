import React, { useEffect, useState } from 'react'
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Chip, Fab } from '@mui/material';
import { RoomService } from '../services/RoomService';
import { PropertiesService } from '../../properties/service/PropertiesService';
import { useNotification } from '../../../shared/hooks/useNotification';


const RoomFormDialog = ({ open, editingRoom, formData, setFormData, onClose, onSuccess }) => {
    const { showSuccess, showError } = useNotification();
    const [properties, setProperties] = useState([]);

    const handleChange = (field) => (e) => {
        setFormData({
            ...formData,
            [field]: e.target.value,
        });
    };

    const handleNumberChange = (field) => (e) => {
        setFormData({
            ...formData,
            [field]: e.target.value,
        });
    };

    const handleCurrencyChange = (field) => (e) => {
        // Xóa mọi ký tự không phải số
        const value = e.target.value.replace(/\D/g, '');
        setFormData({
            ...formData,
            [field]: value === '' ? '' : Number(value),
        });
    };

    const formatCurrency = (value) => {
        if (value === '' || value === null || value === undefined) return '';
        // Định dạng thêm dấu phẩy
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingRoom) {
            const result = await RoomService.updateRoom(editingRoom.id, formData);

            if (result.success) {
                showSuccess("Cập nhật phòng thành công");
                if (onSuccess) {
                    onSuccess();
                    onClose();
                }
            } else {
                showError(result.error || "Cập nhật phòng thất bại!");
            }

        } else {
            const result = await RoomService.addRoom(formData);
            
            if (result.success) {
                showSuccess("Thêm phòng thành công");
                if (onSuccess) {
                    onSuccess();
                    onClose();
                }
            } else {
                showError(result.error || "Thêm phòng thất bại!");
            }
        }
    };

    useEffect(() => {
        const fetchProperties = async () => {
            const response = await PropertiesService.getProperties();

            if (response.success) {
                setProperties(response.data);
            }
        };

        fetchProperties();
    }, []);

    return (
        <Dialog open={open} onClose={onClose} fullScreen>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <DialogTitle>
                    {editingRoom ? 'Sửa phòng' : 'Thêm phòng mới'}
                </DialogTitle>

                <DialogContent>
                    <div className="flex flex-col gap-6 pt-2">
                        <TextField
                            label="Số phòng"
                            fullWidth
                            required
                            value={formData.roomId ?? ''}
                            onChange={handleChange('roomId')}
                            slotProps={{ htmlInput: { maxLength: 50 } }}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Trạng thái</InputLabel>

                            <Select
                                value={formData.status ?? 'AVAILABLE'}
                                label="Trạng thái"
                                onChange={handleChange('status')}
                            >
                                <MenuItem value="AVAILABLE">Trống</MenuItem>
                                <MenuItem value="OCCUPIED">Đang ở</MenuItem>
                                <MenuItem value="MAINTENANCE">Sửa chữa</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Giá phòng (₫)"
                            type="text"
                            fullWidth
                            required
                            value={formatCurrency(formData.currentPrice)}
                            onChange={handleCurrencyChange('currentPrice')}
                        />

                        <FormControl fullWidth required>
                            <InputLabel>Khu trọ</InputLabel>

                            <Select
                                value={formData.propertyId ?? ''}
                                label="Khu trọ"
                                onChange={handleChange('propertyId')}
                            >
                                {properties.map((property) => (
                                    <MenuItem
                                        key={property.id}
                                        value={property.id}
                                    >
                                        {property.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Tầng"
                            type="number"
                            fullWidth
                            value={formData.floor ?? ''}
                            onChange={handleNumberChange('floor')}
                            slotProps={{ htmlInput: { maxLength: 50 } }}
                        />

                        <TextField
                            label="Diện tích (m²)"
                            type="number"
                            fullWidth
                            value={formData.area ?? ''}
                            onChange={handleNumberChange('area')}
                            slotProps={{ htmlInput: { step: "0.01", max: "99999999.99" } }}
                        />
                    </div>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}> Hủy </Button>

                    <Button
                        type="submit"
                        variant="contained"
                    >
                        {editingRoom ? 'Cập nhật' : 'Thêm'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default RoomFormDialog
