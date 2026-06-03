import { useEffect, useState } from 'react';
import { Button, Card, CardContent, Chip, Fab } from '@mui/material';
import { Plus, Edit, Trash2, Home } from 'lucide-react';
import Header from '../../../shared/components/ui/Header';
import InfoItem from '../../../shared/components/ui/InfoItem';
import RoomFormDialog from '../components/RoomFormDialog';
import { RoomService } from '../services/RoomService';
import Loading from '../../../shared/components/ui/Loading';
import { INITIAL_ROOM_FORM_DATA, ROOM_STATUS } from '../dto/RoomDTO';

export function RoomListPage({ onViewChange }) {
  const [open, setOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState(INITIAL_ROOM_FORM_DATA);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const response = await RoomService.getRooms();

      if (response.success) {

        const sortedRooms = [...response.data].sort((a, b) => {
          // Ưu tiên tầng
          if (a.floor !== b.floor) {
            return a.floor - b.floor;
          }

          // Cùng tầng thì theo roomId
          return a.roomId.localeCompare(
            b.roomId,
            undefined,
            { numeric: true }
          );
        });

        setRooms(sortedRooms);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);


  const handleOpen = (room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        propertyId: room.propertyId || '',
        roomId: room.roomId || '',
        status: room.status || 'AVAILABLE',
        currentContractId: room.currentContractId || '',
        currentTenantNames: room.currentTenantNames || [],
        currentPrice: room.currentPrice || '',
        floor: room.floor || '',
        area: room.area || 0,
        createdAt: room.createdAt || '',
        createdBy: room.createdBy || '',
        updatedAt: room.updatedAt || '',
        updatedBy: room.updatedBy || '',
      });
    } else {
      setEditingRoom(null);
      setFormData(INITIAL_ROOM_FORM_DATA);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRoom(null);
  };

  const formatCurrency = (value) => `${value.toLocaleString('vi-VN')} ₫`;

  const onDeleteRoom = async (roomId) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa phòng này không?"
    );

    if (!confirmed) {
      return;
    }

    const response = await RoomService.softDeleteRoom(roomId);

    if (response.success) {
      await fetchRooms();
    } else {
      console.error("Lỗi khi xóa phòng:", response.error);
    }
  };

  return (
    <>
      {loading ? <Loading /> :
        <div className="p-4 pb-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
          <Header title={"Quản lý phòng"} description={`${rooms.length} phòng tổng cộng`} onViewChange={onViewChange} />

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
                <div className={`bg-gradient-to-r ${ROOM_STATUS[room.status]?.bgGradient} p-4 text-white`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Home size={24} />
                      <div>
                        <h3 className="text-xl">Phòng {room.roomId}</h3>
                        <p className="text-sm opacity-90">Tầng {room.floor}</p>
                      </div>
                    </div>
                    <Chip
                      label={ROOM_STATUS[room.status]?.label}
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
                    <InfoItem
                      label="Giá phòng"
                      value={formatCurrency(room.currentPrice)}
                    />

                    {room.area && (
                      <InfoItem
                        label="Diện tích"
                        value={`${room.area} m²`}
                      />
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

          <RoomFormDialog
            open={open}
            editingRoom={editingRoom}
            formData={formData}
            setFormData={setFormData}
            onClose={handleClose}
            onSuccess={fetchRooms}
          />
        </div>
      }
    </>
  );
}
