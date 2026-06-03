import { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { INITIAL_TENANT_FORM_DATA } from '../dto/TenantDTO';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export function TenantFormDialog({ open, onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState(INITIAL_TENANT_FORM_DATA);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData(INITIAL_TENANT_FORM_DATA);
        }
    }, [initialData, open]);

    const handleSubmit = () => {
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onClose={onClose} fullScreen>
            <DialogTitle>{initialData ? 'Sửa thông tin khách thuê' : 'Thêm khách thuê mới'}</DialogTitle>
            <DialogContent>
                <div className="flex flex-col gap-6 pt-2">
                    <TextField
                        label="Họ và tên"
                        slotProps={{
                            htmlInput: {
                                maxLength: 100
                            }
                        }}
                        fullWidth
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />

                    <TextField
                        label="Số điện thoại"
                        type="tel"
                        fullWidth
                        slotProps={{
                            htmlInput: {
                                maxLength: 9
                            }
                        }}
                        value={formData.phone}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');

                            setFormData({
                                ...formData,
                                phone: value,
                            });
                        }}
                    />

                    <TextField
                        label="Số CCCD/CMND"
                        fullWidth
                        slotProps={{
                            htmlInput: {
                                maxLength: 12
                            }
                        }}
                        value={formData.citizenId}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setFormData({ ...formData, citizenId: e.target.value })
                        }}
                    />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Ngày sinh"
                            value={formData.birthDate ? dayjs(formData.birthDate) : null}
                            onChange={(newValue) =>
                                setFormData({
                                    ...formData,
                                    birthDate: newValue?.format('YYYY-MM-DD') || ''
                                })
                            }
                        />
                    </LocalizationProvider>

                    <TextField
                        label="Địa chỉ thường trú"
                        fullWidth
                        multiline
                        rows={2}
                        helperText={`${formData.permanentAddress.length}/255`}
                        slotProps={{
                            htmlInput: {
                                maxLength: 255
                            }
                        }}
                        value={formData.permanentAddress}
                        onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained">
                    {initialData ? 'Cập nhật' : 'Thêm'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
