import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Chip, Fab } from '@mui/material';
import { Plus, Edit, Trash2, Home } from 'lucide-react';

export function RoomListPage({ rooms, onAddRoom, onUpdateRoom, onDeleteRoom }) {
  const [open, setOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    status: 'empty',
    price: 0,
    deposit: 0,
    floor: 1,
    area: 0,
  });

  const handleOpen = (room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        number: room.number,
        status: room.status,
        price: room.price,
        deposit: room.deposit,
        floor: room.floor,
        area: room.area || 0,
      });
    } else {
      setEditingRoom(null);
      setFormData({
        number: '',
        status: 'empty',
        price: 0,
        deposit: 0,
        floor: 1,
        area: 0,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRoom(null);
  };

  const handleSubmit = () => {
    if (editingRoom) {
      onUpdateRoom(editingRoom.id, formData);
    } else {
      onAddRoom(formData);
    }
    handleClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'empty': return 'success';
      case 'occupied': return 'primary';
      case 'repair': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'empty': return 'Trống';
      case 'occupied': return 'Đang ở';
      case 'repair': return 'Sửa chữa';
      default: return '';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'empty': return 'from-green-400 to-emerald-500';
      case 'occupied': return 'from-indigo-400 to-purple-500';
      case 'repair': return 'from-orange-400 to-amber-500';
      default: return '';
    }
  };

  return (
    <div className="p-4 pb-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl mb-1">Quản lý phòng</h1>
        <p className="text-gray-600 text-sm">{rooms.length} phòng tổng cộng</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rooms.map((room) => (
          <Card
            key={room.id}
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <div className={`bg-gradient-to-r ${getStatusBg(room.status)} p-4 text-white`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Home size={24} />
                  <div>
                    <h3 className="text-xl">Phòng {room.number}</h3>
                    <p className="text-sm opacity-90">Tầng {room.floor}</p>
                  </div>
                </div>
                <Chip
                  label={getStatusLabel(room.status)}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              </div>
            </div>

            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Giá phòng</p>
                  <p className="font-medium text-sm">{room.price.toLocaleString('vi-VN')} ₫</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Tiền cọc</p>
                  <p className="font-medium text-sm">{room.deposit.toLocaleString('vi-VN')} ₫</p>
                </div>
                {room.area && (
                  <div className="p-3 bg-gray-50 rounded-xl col-span-2">
                    <p className="text-xs text-gray-600 mb-1">Diện tích</p>
                    <p className="font-medium text-sm">{room.area} m²</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Edit size={16} />}
                  onClick={() => handleOpen(room)}
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
                  onClick={() => onDeleteRoom(room.id)}
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
        <DialogTitle>{editingRoom ? 'Sửa phòng' : 'Thêm phòng mới'}</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            <TextField
              label="Số phòng"
              fullWidth
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.status}
                label="Trạng thái"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="empty">Trống</MenuItem>
                <MenuItem value="occupied">Đang ở</MenuItem>
                <MenuItem value="repair">Sửa chữa</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Giá phòng (₫)"
              type="number"
              fullWidth
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            />

            <TextField
              label="Tiền cọc (₫)"
              type="number"
              fullWidth
              value={formData.deposit}
              onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })}
            />

            <TextField
              label="Tầng"
              type="number"
              fullWidth
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
            />

            <TextField
              label="Diện tích (m²)"
              type="number"
              fullWidth
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingRoom ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
