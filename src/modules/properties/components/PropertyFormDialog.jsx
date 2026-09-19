import { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { PropertiesService } from '../service/PropertiesService';
import { useNotification } from '../../../shared/hooks/useNotification';
import { INITIAL_PROPERTY_FORM_DATA } from '../dto/PropertyDTO';

export function PropertyFormDialog({ open, onClose, onSuccess, editingProperty }) {
    const [formData, setFormData] = useState(INITIAL_PROPERTY_FORM_DATA);
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        if (editingProperty) {
            setFormData({
                ownerId: editingProperty.ownerId || '',
                name: editingProperty.name || '',
                address: editingProperty.address || '',
                roomCount: editingProperty.roomCount || 0,
                occupiedRoomCount: editingProperty.occupiedRoomCount || 0,
                status: editingProperty.status || 'ACTIVE',
            });
        } else {
            setFormData(INITIAL_PROPERTY_FORM_DATA);
        }
    }, [editingProperty, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let result;
            if (editingProperty) {
                result = await PropertiesService.updateProperty(editingProperty.id, formData);
            } else {
                result = await PropertiesService.addProperty(formData);
            }

            if (result.success) {
                showSuccess(editingProperty ? "Cập nhật khu trọ thành công" : "Thêm khu trọ thành công");
                if (onSuccess) {
                    onSuccess();
                }
                onClose();
            } else {
                showError(result.error || "Thao tác thất bại");
            }
        } catch (error) {
            showError(error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullScreen>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <DialogTitle>
                    {editingProperty ? 'Sửa thông tin khu trọ' : 'Thêm khu trọ mới'}
                </DialogTitle>
                <DialogContent>
                    <div className="flex flex-col gap-6 pt-2">
                        <TextField
                            label="Tên khu trọ"
                            fullWidth
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            slotProps={{
                                htmlInput: {
                                    maxLength: 100,
                                },
                            }}
                            helperText="Ví dụ: Nhà trọ Cô Thái, Khu trọ ABC, ..."
                        />

                        <TextField
                            label="Địa chỉ"
                            fullWidth
                            required
                            multiline
                            rows={2}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            slotProps={{
                                htmlInput: {
                                    maxLength: 255,
                                },
                            }}
                            helperText={`${formData.address.length}/255 - Địa chỉ đầy đủ của khu trọ`}
                        />

                        {editingProperty && (
                            <>
                                <TextField
                                    label="Tổng số phòng"
                                    type="number"
                                    fullWidth
                                    disabled
                                    value={formData.roomCount}
                                    helperText="Số lượng phòng được tự động tính từ danh sách phòng"
                                />

                                <TextField
                                    label="Số phòng đang thuê"
                                    type="number"
                                    fullWidth
                                    disabled
                                    value={formData.occupiedRoomCount}
                                    helperText="Số phòng đang thuê được tự động cập nhật"
                                />
                            </>
                        )}

                        {!editingProperty && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                                <p className="font-semibold mb-1">💡 Lưu ý:</p>
                                <p>Sau khi tạo khu trọ, bạn có thể thêm phòng vào khu trọ này từ trang "Phòng trọ".</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5568d3 0%, #65408a 100%)',
                            },
                        }}
                    >
                        {editingProperty ? 'Cập nhật' : 'Thêm'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
