import { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { PropertiesService } from '../../properties/service/PropertiesService';
import { RoomService } from '../../room/services/RoomService';
import { TenantService } from '../../tenant/services/TenantService';
import { ContractService } from '../services/ContractService';
import { useNotification } from '../../../shared/hooks/useNotification';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const INITIAL_CONTRACT_FORM_DATA = {
    propertyId: '',
    roomId: '',
    representativeTenantId: '',
    tenantIds: [],
    depositAmount: '',
    monthlyRent: '',
    billingDay: 1,
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
};

export function ContractFormDialog({ open, onClose, onSuccess, editingContract }) {
    const [formData, setFormData] = useState(INITIAL_CONTRACT_FORM_DATA);
    const [properties, setProperties] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [tenants, setTenants] = useState([]);
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [propRes, roomRes, tenantRes] = await Promise.all([
                    PropertiesService.getProperties(),
                    RoomService.getRooms(),
                    TenantService.getTenants(),
                ]);

                if (propRes.success) setProperties(propRes.data);
                if (roomRes.success) setRooms(roomRes.data);
                if (tenantRes.success) setTenants(tenantRes.data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu khởi tạo:", error);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        if (editingContract) {
            setFormData({
                propertyId: editingContract.propertyId || '',
                roomId: editingContract.roomId || '',
                representativeTenantId: editingContract.representativeTenantId || '',
                tenantIds: editingContract.tenantIds || [],
                depositAmount: editingContract.depositAmount || '',
                monthlyRent: editingContract.monthlyRent || '',
                billingDay: editingContract.billingDay || 1,
                startDate: editingContract.startDate || '',
                endDate: editingContract.endDate || '',
                status: editingContract.status || 'ACTIVE',
            });
        } else {
            setFormData({
                ...INITIAL_CONTRACT_FORM_DATA,
                startDate: dayjs().format('YYYY-MM-DD'),
            });
        }
    }, [editingContract, open]);

    const handlePropertyChange = (e) => {
        setFormData(prev => ({
            ...prev,
            propertyId: e.target.value,
            roomId: '', // Reset room when property changes
        }));
    };

    const handleRepresentativeChange = (e) => {
        const repId = e.target.value;
        setFormData(prev => ({
            ...prev,
            representativeTenantId: repId,
            tenantIds: prev.tenantIds.filter(id => id !== repId), // Ensure representative is not in secondary tenants
        }));
    };

    const handleCurrencyChange = (field) => (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setFormData({
            ...formData,
            [field]: value === '' ? '' : Number(value),
        });
    };

    const formatCurrency = (value) => {
        if (value === '' || value === null || value === undefined) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let result;
            if (editingContract) {
                result = await ContractService.updateContract(editingContract.id, formData);
            } else {
                result = await ContractService.addContract(formData);
            }

            if (result.success) {
                showSuccess(editingContract ? "Cập nhật hợp đồng thành công" : "Tạo hợp đồng thành công");
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

    // Filter rooms belonging to the selected property
    const filteredRooms = rooms.filter(room => room.propertyId === formData.propertyId);

    return (
        <Dialog open={open} onClose={onClose} fullScreen>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <DialogTitle>{editingContract ? 'Sửa thông tin hợp đồng' : 'Thêm hợp đồng mới'}</DialogTitle>
                <DialogContent>
                    <div className="flex flex-col gap-6 pt-2">
                        <FormControl fullWidth required>
                            <InputLabel id="property-select-label">Khu trọ</InputLabel>
                            <Select
                                labelId="property-select-label"
                                value={formData.propertyId}
                                label="Khu trọ"
                                onChange={handlePropertyChange}
                            >
                                {properties.map((property) => (
                                    <MenuItem key={property.id} value={property.id}>
                                        {property.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth required disabled={!formData.propertyId}>
                            <InputLabel id="room-select-label">Phòng</InputLabel>
                            <Select
                                labelId="room-select-label"
                                value={formData.roomId}
                                label="Phòng"
                                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                            >
                                {filteredRooms.map((room) => (
                                    <MenuItem key={room.id} value={room.id}>
                                        Phòng {room.roomId}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth required>
                            <InputLabel id="rep-tenant-select-label">Người đại diện (Khách thuê đại diện)</InputLabel>
                            <Select
                                labelId="rep-tenant-select-label"
                                value={formData.representativeTenantId}
                                label="Người đại diện (Khách thuê đại diện)"
                                onChange={handleRepresentativeChange}
                            >
                                {tenants.map((tenant) => (
                                    <MenuItem key={tenant.id} value={tenant.id}>
                                        {tenant.fullName} - {tenant.phone}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel id="tenants-select-label">Thành viên khác ở cùng</InputLabel>
                            <Select
                                labelId="tenants-select-label"
                                multiple
                                value={formData.tenantIds}
                                onChange={(e) => setFormData({ ...formData, tenantIds: e.target.value })}
                                label="Thành viên khác ở cùng"
                                renderValue={(selected) => (
                                    <div className="flex flex-wrap gap-1">
                                        {selected.map((value) => {
                                            const tenant = tenants.find(t => t.id === value);
                                            return <Chip key={value} label={tenant ? tenant.fullName : value} size="small" />;
                                        })}
                                    </div>
                                )}
                            >
                                {tenants
                                    .filter(t => t.id !== formData.representativeTenantId)
                                    .map((tenant) => (
                                        <MenuItem key={tenant.id} value={tenant.id}>
                                            {tenant.fullName} - {tenant.phone}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Tiền đặt cọc (₫)"
                            fullWidth
                            required
                            value={formatCurrency(formData.depositAmount)}
                            onChange={handleCurrencyChange('depositAmount')}
                        />

                        <TextField
                            label="Giá thuê phòng (₫/tháng)"
                            fullWidth
                            required
                            value={formatCurrency(formData.monthlyRent)}
                            onChange={handleCurrencyChange('monthlyRent')}
                        />

                        <TextField
                            label="Ngày ghi hóa đơn hàng tháng"
                            type="number"
                            slotProps={{
                                htmlInput: {
                                    min: 1,
                                    max: 31
                                }
                            }}
                            fullWidth
                            required
                            value={formData.billingDay}
                            onChange={(e) => setFormData({ ...formData, billingDay: Number(e.target.value) })}
                        />

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Ngày bắt đầu hợp đồng"
                                value={formData.startDate ? dayjs(formData.startDate) : null}
                                onChange={(newValue) =>
                                    setFormData({
                                        ...formData,
                                        startDate: newValue?.format('YYYY-MM-DD') || ''
                                    })
                                }
                                slotProps={{
                                    textField: {
                                        required: true,
                                        fullWidth: true,
                                    },
                                }}
                            />
                        </LocalizationProvider>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Ngày kết thúc hợp đồng (Không bắt buộc)"
                                value={formData.endDate ? dayjs(formData.endDate) : null}
                                onChange={(newValue) =>
                                    setFormData({
                                        ...formData,
                                        endDate: newValue?.format('YYYY-MM-DD') || ''
                                    })
                                }
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                    },
                                }}
                            />
                        </LocalizationProvider>

                        {editingContract && (
                            <FormControl fullWidth>
                                <InputLabel id="status-select-label">Trạng thái hợp đồng</InputLabel>
                                <Select
                                    labelId="status-select-label"
                                    value={formData.status}
                                    label="Trạng thái hợp đồng"
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <MenuItem value="ACTIVE">Hiệu lực</MenuItem>
                                    <MenuItem value="EXPIRED">Hết hạn</MenuItem>
                                    <MenuItem value="TERMINATED">Đã chấm dứt</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    </div>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="submit" variant="contained">
                        {editingContract ? 'Cập nhật' : 'Thêm'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
