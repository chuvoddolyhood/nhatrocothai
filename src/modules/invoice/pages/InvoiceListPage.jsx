import { useState } from 'react';
import { Button, Dialog, Card, CardContent, Chip, Fab } from '@mui/material';
import { Plus, Zap, Droplet, Eye, Check } from 'lucide-react';
import { MeterReadingForm } from '../../meter-reading/components/MeterReadingForm';
import { InvoicePreview } from '../components/InvoicePreview';
import Header from '../../../shared/components/ui/Header';

export function InvoiceListPage({ bills, rooms, tenants, onCreateBill, onMarkPaid }) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [meterReadingOpen, setMeterReadingOpen] = useState(null);
  const [invoicePreview, setInvoicePreview] = useState(null);

  const [billData, setBillData] = useState({
    electricCurrent: 0,
    waterCurrent: 0,
    otherServices: [],
  });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthBills = bills.filter(b => b.month === currentMonth);

  const handleSelectRoom = (roomId) => {
    setSelectedRoom(roomId);
    const lastBill = bills
      .filter(b => b.roomId === roomId)
      .sort((a, b) => b.month.localeCompare(a.month))[0];

    setBillData({
      electricCurrent: 0,
      waterCurrent: 0,
      otherServices: lastBill?.otherServices || [],
    });
  };

  const handleMeterReading = (type, reading) => {
    if (type === 'electric') {
      setBillData({ ...billData, electricCurrent: reading });
    } else {
      setBillData({ ...billData, waterCurrent: reading });
    }
    setMeterReadingOpen(null);
  };

  const handleCreateBill = () => {
    if (!selectedRoom) return;

    const room = rooms.find(r => r.id === selectedRoom);
    const tenant = tenants.find(t => t.roomId === selectedRoom);
    const lastBill = bills
      .filter(b => b.roomId === selectedRoom)
      .sort((a, b) => b.month.localeCompare(a.month))[0];

    if (!room || !tenant) return;

    const newBill = {
      roomId: selectedRoom,
      roomNumber: room.number,
      tenantName: tenant.name,
      month: currentMonth,
      roomPrice: room.price,
      electricPrevious: lastBill?.electricCurrent || 0,
      electricCurrent: billData.electricCurrent,
      electricPrice: 3500,
      waterPrevious: lastBill?.waterCurrent || 0,
      waterCurrent: billData.waterCurrent,
      waterPrice: 15000,
      otherServices: billData.otherServices,
      paid: false,
    };

    onCreateBill(newBill);
    setSelectedRoom('');
    setBillData({
      electricCurrent: 0,
      waterCurrent: 0,
      otherServices: [],
    });
    setCreateDialogOpen(false);
  };

  const getPreviousReading = (type) => {
    if (!selectedRoom) return 0;
    const lastBill = bills
      .filter(b => b.roomId === selectedRoom)
      .sort((a, b) => b.month.localeCompare(a.month))[0];

    return type === 'electric' ? lastBill?.electricCurrent || 0 : lastBill?.waterCurrent || 0;
  };

  const selectedRoomData = rooms.find(r => r.id === selectedRoom);
  const hasReadings = billData.electricCurrent > 0 && billData.waterCurrent > 0;

  return (
    <div className="p-4 pb-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <Header title={"Hóa đơn"} description={`Tháng ${currentMonth}`} />

      <div className="space-y-4">
        {currentMonthBills.map((bill) => (
          <Card
            key={bill.id}
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <div className={`bg-gradient-to-r ${bill.paid ? 'from-green-400 to-emerald-500' : 'from-orange-400 to-red-500'} p-4 text-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">Phòng {bill.roomNumber}</h3>
                  <p className="text-sm opacity-90">{bill.tenantName}</p>
                </div>
                <Chip
                  label={bill.paid ? 'Đã đóng' : 'Chưa đóng'}
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
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Tổng tiền:</span>
                  <span className="text-2xl font-bold text-indigo-600">{bill.total.toLocaleString('vi-VN')} ₫</span>
                </div>

                <div className="space-y-2 mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tiền phòng:</span>
                    <span>{bill.roomPrice.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Zap size={14} className="text-yellow-500" />
                      Điện ({bill.electricCurrent - bill.electricPrevious} kWh):
                    </span>
                    <span>{((bill.electricCurrent - bill.electricPrevious) * bill.electricPrice).toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Droplet size={14} className="text-blue-500" />
                      Nước ({bill.waterCurrent - bill.waterPrevious} m³):
                    </span>
                    <span>{((bill.waterCurrent - bill.waterPrevious) * bill.waterPrice).toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Eye size={16} />}
                  onClick={() => setInvoicePreview(bill)}
                  fullWidth
                  sx={{ borderRadius: '8px' }}
                >
                  Xem
                </Button>
                {!bill.paid && (
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<Check size={16} />}
                    onClick={() => onMarkPaid(bill.id, new Date().toISOString())}
                    fullWidth
                    sx={{ borderRadius: '8px' }}
                  >
                    Đã đóng
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {currentMonthBills.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Chưa có hóa đơn nào tháng này</p>
          </div>
        )}
      </div>

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setCreateDialogOpen(true)}
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

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullScreen>
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
          <h2 className="text-2xl mb-6">Tạo hóa đơn mới</h2>

          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 3 }}>
            <CardContent className="p-4">
              <label className="text-sm text-gray-600 mb-2 block">Chọn phòng</label>
              <select
                className="w-full p-3 border rounded-xl bg-white"
                value={selectedRoom}
                onChange={(e) => handleSelectRoom(e.target.value)}
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.map((room) => {
                  const tenant = tenants.find(t => t.roomId === room.id);
                  return tenant ? (
                    <option key={room.id} value={room.id}>
                      Phòng {room.number} - {tenant.name}
                    </option>
                  ) : null;
                })}
              </select>
            </CardContent>
          </Card>

          {selectedRoom && (
            <>
              <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 3 }}>
                <CardContent className="p-4">
                  <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white mb-4">
                    <p className="text-sm opacity-90 mb-1">Tiền phòng</p>
                    <p className="text-2xl font-bold">{selectedRoomData?.price.toLocaleString('vi-VN')} ₫</p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setMeterReadingOpen('electric')}
                      className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                          <Zap className="text-white" size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-gray-600">Chỉ số điện</p>
                          <p className="font-medium">{billData.electricCurrent || 'Chưa ghi'}</p>
                        </div>
                      </div>
                      <Button size="small" variant="outlined">Ghi số</Button>
                    </button>

                    <button
                      onClick={() => setMeterReadingOpen('water')}
                      className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                          <Droplet className="text-white" size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-gray-600">Chỉ số nước</p>
                          <p className="font-medium">{billData.waterCurrent || 'Chưa ghi'}</p>
                        </div>
                      </div>
                      <Button size="small" variant="outlined">Ghi số</Button>
                    </button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setSelectedRoom('');
                  }}
                  fullWidth
                  sx={{ borderRadius: '12px', py: 1.5 }}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCreateBill}
                  disabled={!hasReadings}
                  fullWidth
                  sx={{ borderRadius: '12px', py: 1.5 }}
                >
                  Tạo hóa đơn
                </Button>
              </div>
            </>
          )}
        </div>
      </Dialog>

      <Dialog
        open={meterReadingOpen !== null}
        onClose={() => setMeterReadingOpen(null)}
        fullScreen
      >
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
          {meterReadingOpen && selectedRoomData && (
            <MeterReadingForm
              roomNumber={selectedRoomData.number}
              meterType={meterReadingOpen}
              previousReading={getPreviousReading(meterReadingOpen)}
              onConfirm={(reading) => handleMeterReading(meterReadingOpen, reading)}
              onCancel={() => setMeterReadingOpen(null)}
            />
          )}
        </div>
      </Dialog>

      <Dialog
        open={invoicePreview !== null}
        onClose={() => setInvoicePreview(null)}
        fullScreen
      >
        {invoicePreview && (
          <InvoicePreview
            bill={invoicePreview}
            onClose={() => setInvoicePreview(null)}
          />
        )}
      </Dialog>
    </div>
  );
}
