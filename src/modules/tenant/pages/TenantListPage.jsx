import { useState, useEffect, useRef } from 'react';
import { Button, Card, CardContent, Fab, CircularProgress, Chip } from '@mui/material';
import { Plus, Edit, User, Phone, CreditCard, Calendar, MapPin, UserRoundX, Eye, Home } from 'lucide-react';
import Loading, { SkeletonList } from '../../../shared/components/ui/Loading';
import { TenantService } from '../services/TenantService';
import { ContractService } from '../../contract/services/ContractService';
import { RoomService } from '../../room/services/RoomService';
import { TenantFormDialog } from '../components/TenantFormDialog';
import { TenantDetailDialog } from '../components/TenantDetailDialog';
import { TenantStatusFilter } from '../components/TenantStatusFilter';
import InfoItem from '../../../shared/components/ui/InfoItem';
import { TenantStatus, TenantStatusLabel } from '../constants/TenantStatus';
import { useNotification } from '../../../shared/hooks/useNotification';

export function TenantListPage({ setHeaderConfig }) {
  const [initialLoading, setInitialLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const isFirstLoad = useRef(true);
  const [tenants, setTenants] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const { showSuccess, showError } = useNotification();

  const [open, setOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingTenant, setViewingTenant] = useState(null);
  const [viewingIndex, setViewingIndex] = useState(0);

  const [statusFilter, setStatusFilter] = useState(TenantStatus.ACTIVE);

  const contractsRef = useRef([]);
  const roomsRef = useRef([]);

  const fetchTenants = async (status = statusFilter) => {
    try {
      if (isFirstLoad.current) {
        setInitialLoading(true);
      } else {
        setListLoading(true);
      }

      const fetchData = Promise.all([
        TenantService.getTenants({ status }),
        ContractService.getContracts(),
        RoomService.getRooms()
      ]);

      const [tenantRes, contractRes, roomRes] = await fetchData;

      if (tenantRes.success) {
        if (contractRes.success) {
          contractsRef.current = contractRes.data;
          setContracts(contractRes.data);
        }
        if (roomRes.success) {
          roomsRef.current = roomRes.data;
          setRooms(roomRes.data);
        }
        setTenants(tenantRes.data);
        setHeaderConfig({
          title: "Khách thuê",
          description: `${tenantRes.data.length} khách thuê`
        });
      }
    } catch (error) {
      showError(error);
    } finally {
      if (isFirstLoad.current) {
        setInitialLoading(false);
        isFirstLoad.current = false;
      } else {
        setListLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTenants(statusFilter);
  }, [statusFilter]);

  const handleStatusFilterChange = (_, newStatus) => {
    if (newStatus !== null) {
      setStatusFilter(newStatus);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpen = (tenant) => {
    setEditingTenant(tenant || null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTenant(null);
  };

  const handleOpenDetail = (tenant, index) => {
    setViewingTenant(tenant);
    setViewingIndex(index);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setViewingTenant(null);
  };

  const onDeleteTenant = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách thuê này?')) {
      const result = await TenantService.softDeleteTenant(id);
      if (result.success) {
        showSuccess("Đã chuyển khách thuê sang trạng thái Đã dời đi");
        fetchTenants();
      } else {
        showError(result.error);
      }
    }
  };

  const gradients = [
    'from-purple-400 to-pink-500',
    'from-blue-400 to-cyan-500',
    'from-green-400 to-emerald-500',
    'from-orange-400 to-red-500',
    'from-indigo-400 to-purple-500',
  ];

  return (
    <>
      {initialLoading ? <Loading /> :
        <div className="p-4 pb-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen" style={{ paddingTop: '56px' }}>

          <TenantStatusFilter
            value={statusFilter}
            onChange={handleStatusFilterChange}
          />

          <div className="grid grid-cols-1 gap-4">
            {listLoading ? (
              <SkeletonList count={3} />
            ) : tenants.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Chưa có khách thuê nào.</div>
            ) : tenants.map((tenant, index) => {
              // Get all rooms for this tenant
              const tenantContracts = contractsRef.current.filter(c =>
                c.representativeTenantId === tenant.id ||
                (c.tenantIds && c.tenantIds.includes(tenant.id))
              );

              const activeRooms = [];
              const pastRooms = [];

              tenantContracts.forEach(c => {
                const room = roomsRef.current.find(r => r.id === c.roomId);
                const roomName = room ? room.roomId : c.roomId;
                if (!roomName) return;

                if (c.status === 'ACTIVE') {
                  if (!activeRooms.includes(roomName)) activeRooms.push(roomName);
                } else {
                  if (!pastRooms.includes(roomName)) pastRooms.push(roomName);
                }
              });

              return (
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
                          <h3 className="text-lg font-medium flex items-center gap-2">
                            <span className="block max-w-[200px] truncate">
                              {tenant.fullName}
                            </span>
                            {tenant.status !== TenantStatus.ACTIVE && (
                              <Chip
                                label={TenantStatusLabel[tenant.status]}
                                size="small"
                                sx={{ height: '20px', fontWeight: 600, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }}
                              />
                            )}
                          </h3>
                          {/* Hiển thị phòng theo filter đang chọn */}
                          {statusFilter === TenantStatus.ACTIVE ? (
                            activeRooms.length > 0 && (
                              <div className="flex items-center gap-1 mt-1 text-sm text-white/90 font-medium">
                                <span className="truncate max-w-[200px]">Phòng: {activeRooms.join(', ')}</span>
                              </div>
                            )
                          ) : (
                            pastRooms.length > 0 && (
                              <div className="flex items-center gap-1 mt-1 text-sm text-white/90 font-medium">
                                <span className="truncate max-w-[200px]">Từng ở: {pastRooms.join(', ')}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <InfoItem
                        icon={<Phone size={18} className="text-indigo-600" />}
                        label="Số điện thoại"
                        value={tenant.phone}
                      />

                      <InfoItem
                        icon={<CreditCard size={18} className="text-purple-600" />}
                        label="CCCD/CMND"
                        value={tenant.citizenId}
                      />

                      <InfoItem
                        icon={<Calendar size={18} className="text-green-600" />}
                        label="Ngày sinh"
                        value={tenant.birthDate ? new Date(tenant.birthDate).toLocaleDateString('vi-VN') : '---'}
                      />

                      <InfoItem
                        icon={<MapPin size={18} className="text-red-600" />}
                        label="Địa chỉ thường trú"
                        value={
                          <span className="block max-w-[100px] truncate">
                            {tenant.permanentAddress || '---'}
                          </span>
                        }
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Eye size={16} />}
                        onClick={() => handleOpenDetail(tenant, index)}
                        fullWidth
                        sx={{ borderRadius: '8px' }}
                      >
                        Xem
                      </Button>
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
                      {tenant.status !== TenantStatus.MOVED_OUT && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<UserRoundX size={16} />}
                          onClick={() => onDeleteTenant(tenant.id)}
                          fullWidth
                          sx={{ borderRadius: '8px', fontSize: '0.65rem' }}
                        >
                          {TenantStatusLabel.MOVED_OUT}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Floating Action Button (Only shown in ACTIVE tab) */}
          {statusFilter === TenantStatus.ACTIVE && (
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
          )}

          <TenantFormDialog
            open={open}
            editingTenant={editingTenant}
            onClose={handleClose}
            onSuccess={fetchTenants}
          />

          <TenantDetailDialog
            open={detailOpen}
            onClose={handleCloseDetail}
            tenant={viewingTenant}
            gradientIndex={viewingIndex}
            onEdit={handleOpen}
            contracts={contracts}
            rooms={rooms}
          />
        </div>
      }
    </>
  );
}
