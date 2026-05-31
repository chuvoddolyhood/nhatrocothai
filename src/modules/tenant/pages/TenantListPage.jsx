import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Card, CardContent, Fab } from '@mui/material';
import { Plus, Edit, Trash2, User, Phone, CreditCard, Calendar, Home } from 'lucide-react';

export function TenantListPage({ tenants, availableRooms, onAddTenant, onUpdateTenant, onDeleteTenant }) {
  const [open, setOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idCard: '',
    moveInDate: '',
    roomId: '',
    roomNumber: '',
  });

  const handleOpen = (tenant) => {
    if (tenant) {
      setEditingTenant(tenant);
      setFormData({
        name: tenant.name,
        phone: tenant.phone,
        idCard: tenant.idCard,
        moveInDate: tenant.moveInDate,
        roomId: tenant.roomId,
        roomNumber: tenant.roomNumber,
      });
    } else {
      setEditingTenant(null);
      setFormData({
        name: '',
        phone: '',
        idCard: '',
        moveInDate: new Date().toISOString().split('T')[0],
        roomId: '',
        roomNumber: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTenant(null);
  };

  const handleSubmit = () => {
    if (editingTenant) {
      onUpdateTenant(editingTenant.id, formData);
    } else {
      onAddTenant(formData);
    }
    handleClose();
  };

  const gradients = [
    'from-purple-400 to-pink-500',
    'from-blue-400 to-cyan-500',
    'from-green-400 to-emerald-500',
    'from-orange-400 to-red-500',
    'from-indigo-400 to-purple-500',
  ];

  return (
    <div className="p-4 pb-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl mb-1">Khách thuê</h1>
        <p className="text-gray-600 text-sm">{tenants.length} khách đang thuê</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tenants.map((tenant, index) => (
          <Card
            key={tenant.id}
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <div className={`bg-gradient-to-r ${gradients[index % gradients.length]} p-4 text-white`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{tenant.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Home size={14} />
                      <span className="text-sm opacity-90">Phòng {tenant.roomNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone size={18} className="text-indigo-600" />
                  <div>
                    <p className="text-xs text-gray-600">Số điện thoại</p>
                    <p className="text-sm font-medium">{tenant.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <CreditCard size={18} className="text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-600">CCCD/CMND</p>
                    <p className="text-sm font-medium">{tenant.idCard}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar size={18} className="text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Ngày dọn vào</p>
                    <p className="text-sm font-medium">{new Date(tenant.moveInDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Edit size={16} />}
                  onClick={() => handleOpen(tenant)}
                  fullWidth
                  sx={{ borderRadius: '8px' }}
                >
                  Sửa
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Trash2 size={16} />}
                  onClick={() => onDeleteTenant(tenant.id)}
                  fullWidth
                  sx={{ borderRadius: '8px' }}
                >
                  Xóa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpen()}
        sx={{
          position: 'fixed',
          bottom: 90,
          right: 20,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5568d3 0%, #65408a 100%)',
          },
        }}
      >
        <Plus />
      </Fab>

      <Dialog open={open} onClose={handleClose} fullScreen>
        <DialogTitle>{editingTenant ? 'Sửa thông tin khách thuê' : 'Thêm khách thuê mới'}</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            <TextField
              label="Họ và tên"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <TextField
              label="Số điện thoại"
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <TextField
              label="Số CCCD/CMND"
              fullWidth
              value={formData.idCard}
              onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
            />

            <TextField
              label="Ngày dọn vào"
              type="date"
              fullWidth
              value={formData.moveInDate}
              onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Phòng"
              select
              fullWidth
              value={formData.roomId}
              onChange={(e) => {
                const room = availableRooms.find(r => r.id === e.target.value);
                setFormData({
                  ...formData,
                  roomId: e.target.value,
                  roomNumber: room?.number || ''
                });
              }}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">-- Chọn phòng --</option>
              {availableRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  Phòng {room.number}
                </option>
              ))}
            </TextField>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTenant ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
