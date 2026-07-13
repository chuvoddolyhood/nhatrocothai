import { useState, useEffect, useRef } from 'react';
import {
  Card, CardContent, Fab, CircularProgress, Chip,
  Button, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Plus, Eye, Check, Zap, Droplet, Receipt, Edit } from 'lucide-react';
import Loading from '../../../shared/components/ui/Loading';
import { InvoiceService } from '../services/InvoiceService';
import { InvoiceStatusFilter } from '../components/InvoiceStatusFilter';
import { InvoiceFormDialog } from '../components/InvoiceFormDialog';
import { InvoiceDetailDialog } from '../components/InvoiceDetailDialog';
import { InvoicePaymentDialog } from '../components/InvoicePaymentDialog';
import { InvoiceStatus } from '../constants/InvoiceStatus';
import { useNotification } from '../../../shared/hooks/useNotification';
import { getMenuLabel } from '../../../shared/components/common/MenuConfig';

// Gradient cho card (xoay vòng)
const gradients = [
  'from-indigo-400 to-purple-500',
  'from-cyan-400 to-blue-500',
  'from-amber-400 to-orange-500',
  'from-violet-400 to-fuchsia-500',
  'from-teal-400 to-emerald-500',
];

// Tạo danh sách tháng 12 tháng gần nhất
function getMonthOptions() {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
    opts.push({ val, label });
  }
  return opts;
}

const MONTH_OPTIONS = getMonthOptions();

export function InvoiceListPage({ view, setHeaderConfig }) {
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Filter state
  const [monthFilter, setMonthFilter] = useState(currentMonth);
  const [statusFilter, setStatusFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');

  // Data state
  const [invoices, setInvoices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const isFirstLoad = useRef(true);

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [detailInvoice, setDetailInvoice] = useState(null);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const { showSuccess, showError } = useNotification();

  // ─── Fetch ───────────────────────────────────────────────
  const fetchInvoices = async (filters = {}) => {
    try {
      if (isFirstLoad.current) {
        setInitialLoading(true);
      } else {
        setListLoading(true);
      }

      const fetchData = isFirstLoad.current
        ? Promise.all([
          InvoiceService.getInvoices(filters),
          InvoiceService.getRoomsForFilter(),
        ])
        : Promise.all([
          InvoiceService.getInvoices(filters),
          Promise.resolve({ success: true, data: rooms }),
        ]);

      const [invoiceRes, roomRes] = await fetchData;

      if (invoiceRes.success) {
        setInvoices(invoiceRes.data);
        if (setHeaderConfig) {
          setHeaderConfig({
            title: getMenuLabel(view) || 'Hóa đơn',
            description: `${invoiceRes.data.length} hóa đơn`,
          });
        }
      }
      if (roomRes.success && isFirstLoad.current) {
        setRooms(roomRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        setInitialLoading(false);
      } else {
        setListLoading(false);
      }
    }
  };

  useEffect(() => {
    const filters = {};
    if (monthFilter) filters.month = monthFilter;
    if (statusFilter) filters.status = statusFilter;
    if (roomFilter) filters.roomId = roomFilter;
    fetchInvoices(filters);
  }, [monthFilter, statusFilter, roomFilter]);

  // ─── Handlers ────────────────────────────────────────────
  const handleStatusFilterChange = (_, newValue) => {
    if (newValue !== null) setStatusFilter(newValue);
  };

  const handleMarkPaidClick = (invoice) => {
    setPaymentInvoice(invoice);
  };

  const handleConfirmPayment = async (paymentData) => {
    if (!paymentInvoice) return;
    setPaymentLoading(true);
    try {
      const result = await InvoiceService.markAsPaid(
        paymentInvoice.id,
        paymentInvoice.roomId,
        paymentData,
      );
      if (result.success) {
        showSuccess('Đã ghi nhận thanh toán thành công!');
        setPaymentInvoice(null);
        isFirstLoad.current = false;
        const filters = {};
        if (monthFilter) filters.month = monthFilter;
        if (statusFilter) filters.status = statusFilter;
        if (roomFilter) filters.roomId = roomFilter;
        fetchInvoices(filters);
      } else {
        showError(result.error || 'Ghi nhận thanh toán thất bại');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleFormSuccess = (action) => {
    isFirstLoad.current = false;
    const filters = {};
    if (monthFilter) filters.month = monthFilter;
    if (statusFilter) filters.status = statusFilter;
    if (roomFilter) filters.roomId = roomFilter;
    fetchInvoices(filters);

    if (action === 'delete') {
      showSuccess('Đã xóa hóa đơn thành công!');
    } else {
      showSuccess(action === 'edit' ? 'Cập nhật hóa đơn thành công!' : 'Tạo hóa đơn thành công!');
    }

    setEditInvoice(null);
  };

  const handleOpenFormDialog = () => {
    setEditInvoice(null);
    setFormOpen(true);
  };

  const handleCloseFormDialog = () => {
    setEditInvoice(null);
    setFormOpen(false);
  };

  const handleEditClick = (invoice) => {
    setEditInvoice(invoice);
    setFormOpen(true);
  };

  // ─── Render ───────────────────────────────────────────────
  if (initialLoading) return <Loading />;

  return (
    <>
      <div className="p-4 pb-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">

        {/* ─── Filter Bar ─── */}
        <div className="mb-4 flex flex-col gap-3">
          {/* Tháng */}
          <FormControl size="small" fullWidth>
            <InputLabel>Tháng</InputLabel>
            <Select
              value={monthFilter}
              label="Tháng"
              onChange={e => setMonthFilter(e.target.value)}
              sx={{ borderRadius: '12px' }}
            >
              <MenuItem value="">Tất cả tháng</MenuItem>
              {MONTH_OPTIONS.map(o => (
                <MenuItem key={o.val} value={o.val}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Phòng */}
          {rooms.length > 0 && (
            <FormControl size="small" fullWidth>
              <InputLabel>Phòng</InputLabel>
              <Select
                value={roomFilter}
                label="Phòng"
                onChange={e => setRoomFilter(e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="">Tất cả phòng</MenuItem>
                {rooms.map(r => (
                  <MenuItem key={r.id} value={r.id}>
                    Phòng {r.roomCode}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>

        {/* Status filter */}
        <InvoiceStatusFilter
          value={statusFilter}
          onChange={handleStatusFilterChange}
        />

        {/* ─── Invoice List ─── */}
        <div className="flex flex-col gap-4">
          {listLoading ? (
            <div className="flex justify-center py-12">
              <CircularProgress size={36} sx={{ color: '#667eea' }} />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Receipt size={52} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-600">Chưa có hóa đơn nào</p>
              <p className="text-sm mt-1">Nhấn + để tạo hóa đơn mới</p>
            </div>
          ) : invoices.map((invoice, index) => {
            const isPaid = invoice.status === InvoiceStatus.PAID;
            const isOverdue = invoice.status === 'OVERDUE';
            const headerGradient = isPaid
              ? 'from-emerald-400 to-teal-500'
              : isOverdue
                ? 'from-red-500 to-rose-600'
                : gradients[index % gradients.length];

            return (
              <Card
                key={invoice.id}
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                }}
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${headerGradient} p-4 text-white`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">Phòng {invoice.roomCode}</h3>
                      <p className="text-sm text-white/85">{invoice.representativeTenantName || '---'}</p>
                      <p className="text-xs text-white/70 mt-0.5">Tháng {invoice.month}</p>
                    </div>
                    <Chip
                      label={
                        isPaid ? 'Đã thanh toán'
                          : isOverdue ? 'Quá hạn'
                            : 'Chưa thanh toán'
                      }
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.25)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Tổng tiền */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-500">Tổng tiền:</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {(invoice.totalAmount || 0).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>

                  {/* Chi tiết ngắn */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-yellow-50 rounded-xl p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-yellow-600 mb-0.5">
                        <Zap size={12} />
                        <span className="text-xs font-medium">Điện</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {invoice.electricUsage ?? 0} kWh
                      </p>
                      <p className="text-sm font-semibold text-yellow-700">
                        {(invoice.electricFee || 0).toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-600 mb-0.5">
                        <Droplet size={12} />
                        <span className="text-xs font-medium">Nước</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {invoice.waterUsage ?? 0} m³
                      </p>
                      <p className="text-sm font-semibold text-blue-700">
                        {(invoice.waterFee || 0).toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Eye size={14} />}
                      onClick={() => setDetailInvoice(invoice)}
                      fullWidth
                      sx={{ borderRadius: '8px', fontSize: '0.75rem', p: 0.5 }}
                    >
                      Xem
                    </Button>
                    {!isPaid && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        startIcon={<Edit size={14} />}
                        onClick={() => handleEditClick(invoice)}
                        fullWidth
                        sx={{ borderRadius: '8px', fontSize: '0.75rem', p: 0.5 }}
                      >
                        Sửa
                      </Button>
                    )}
                    {!isPaid && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<Check size={14} />}
                        onClick={() => handleMarkPaidClick(invoice)}
                        fullWidth
                        sx={{ borderRadius: '8px', fontSize: '0.75rem', p: 0.5 }}
                      >
                        Th.Toán
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAB */}
      <Fab
        color="primary"
        aria-label="Tạo hóa đơn"
        onClick={handleOpenFormDialog}
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

      {/* Form Dialog */}
      <InvoiceFormDialog
        open={formOpen}
        onClose={handleCloseFormDialog}
        onSuccess={handleFormSuccess}
        editInvoice={editInvoice}
      />

      {/* Detail Dialog */}
      <InvoiceDetailDialog
        open={detailInvoice !== null}
        onClose={() => setDetailInvoice(null)}
        invoice={detailInvoice}
        onMarkPaid={handleMarkPaidClick}
      />

      {/* Payment Dialog */}
      <InvoicePaymentDialog
        open={paymentInvoice !== null}
        onClose={() => setPaymentInvoice(null)}
        invoice={paymentInvoice}
        onConfirm={handleConfirmPayment}
        loading={paymentLoading}
      />
    </>
  );
}
