import { useState, useEffect, useRef } from 'react';
import { Button, Card, CardContent, Fab, CircularProgress } from '@mui/material';
import { Plus, Edit, FileSignature, Calendar, DollarSign, Users, Shredder, Eye } from 'lucide-react';
import Loading from '../../../shared/components/ui/Loading';
import { ContractService } from '../services/ContractService';
import { RoomService } from '../../room/services/RoomService';
import { TenantService } from '../../tenant/services/TenantService';
import { useNotification } from '../../../shared/hooks/useNotification';
import { getMenuLabel } from '../../../shared/components/common/MenuConfig';
import InfoItem from '../../../shared/components/ui/InfoItem';
import { ContractFormDialog } from '../components/ContractFormDialog';
import { ContractDetailDialog } from '../components/ContractDetailDialog';
import { ContractStatusFilter } from '../components/ContractStatusFilter';
import { ContractStatus, ContractStatusLabel } from '../constants/ContractStatus';


export function ContractListPage({ view, setHeaderConfig }) {
  const [initialLoading, setInitialLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [statusFilter, setStatusFilter] = useState(ContractStatus.ACTIVE);
  const isFirstLoad = useRef(true);

  const [open, setOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingContract, setViewingContract] = useState(null);
  const [viewingIndex, setViewingIndex] = useState(0);

  const { showSuccess, showError } = useNotification();

  const fetchContracts = async (status = statusFilter) => {
    try {
      if (isFirstLoad.current) {
        setInitialLoading(true);
      } else {
        setListLoading(true);
      }

      const fetchData = isFirstLoad.current
        ? Promise.all([
          ContractService.getContracts({ status }),
          RoomService.getRooms(),
          TenantService.getTenants(),
        ])
        : Promise.all([
          ContractService.getContracts({ status }),
          Promise.resolve({ success: true, data: rooms }),
          Promise.resolve({ success: true, data: tenants }),
        ]);

      const [contractRes, roomRes, tenantRes] = await fetchData;

      if (contractRes.success) {
        setContracts(contractRes.data);
        setHeaderConfig({
          title: getMenuLabel(view),
          description: `${contractRes.data.length} hợp đồng`
        });
      }
      if (roomRes.success) setRooms(roomRes.data);
      if (tenantRes.success) setTenants(tenantRes.data);
    } catch (error) {
      console.error(error);
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
    fetchContracts(statusFilter);
  }, [statusFilter]);

  const handleStatusFilterChange = (_, newStatus) => {
    if (newStatus !== null) {
      setStatusFilter(newStatus);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- Form dialog (Create / Edit) ---
  const handleOpenForm = (contract) => {
    setEditingContract(contract || null);
    setOpen(true);
  };

  const handleCloseForm = () => {
    setOpen(false);
    setEditingContract(null);
  };

  // --- Detail dialog ---
  const handleOpenDetail = (contract, index) => {
    setViewingContract(contract);
    setViewingIndex(index);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setViewingContract(null);
  };

  // --- Terminate ---
  const onDeleteContract = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn kết thúc (chấm dứt) hợp đồng này?")) {
      try {
        const result = await ContractService.updateContractStatus(id, ContractStatus.TERMINATED);
        if (result.success) {
          showSuccess("Đã chấm dứt hợp đồng thành công");
          fetchContracts();
        } else {
          showError(result.error || "Thao tác thất bại");
        }
      } catch (error) {
        showError(error);
      }
    }
  };

  const gradients = [
    'from-emerald-400 to-teal-500',
    'from-cyan-400 to-blue-500',
    'from-violet-400 to-fuchsia-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-red-500',
  ];

  return (
    <>
      {initialLoading ? <Loading /> :
        <div className="p-4 pb-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen" style={{ paddingTop: '56px' }}>

          {/* Status Filter */}
          <ContractStatusFilter
            value={statusFilter}
            onChange={handleStatusFilterChange}
          />

          {/* Contract list */}
          <div className="grid grid-cols-1 gap-4">
            {listLoading ? (
              <div className="flex justify-center py-12">
                <CircularProgress size={36} sx={{ color: '#667eea' }} />
              </div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Chưa có hợp đồng nào.</div>
            ) : contracts.map((contract, index) => {
              const room = rooms.find(r => r.id === contract.roomId);
              const roomName = room ? room.roomId : contract.roomId;

              const tenant = tenants.find(t => t.id === contract.representativeTenantId);
              const tenantName = tenant ? tenant.fullName : (contract.representativeTenantId || '---');

              return (
                <Card
                  key={contract.id}
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
                          <FileSignature size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Hợp đồng phòng {roomName}</h3>
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full mt-1 inline-block">
                            {contract.status === 'ACTIVE' ? 'Đang hiệu lực' :
                              contract.status === 'EXPIRED' ? 'Đã hết hạn' : 'Đã chấm dứt'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <InfoItem
                        icon={<DollarSign size={18} className="text-blue-600" />}
                        label="Giá thuê"
                        value={`${contract.monthlyRent?.toLocaleString()}đ`}
                      />

                      <InfoItem
                        icon={<DollarSign size={18} className="text-emerald-600" />}
                        label="Tiền cọc"
                        value={`${contract.depositAmount?.toLocaleString()}đ`}
                      />

                      <InfoItem
                        icon={<Calendar size={18} className="text-indigo-600" />}
                        label="Ngày bắt đầu"
                        value={contract.startDate ? new Date(contract.startDate.toDate ? contract.startDate.toDate() : contract.startDate).toLocaleDateString('vi-VN') : '---'}
                      />

                      <InfoItem
                        icon={<Users size={18} className="text-orange-600" />}
                        label="Đại diện"
                        value={tenantName}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Eye size={16} />}
                        onClick={() => handleOpenDetail(contract, index)}
                        fullWidth
                        sx={{ borderRadius: '8px' }}
                      >
                        Xem
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit size={16} />}
                        onClick={() => handleOpenForm(contract)}
                        fullWidth
                        sx={{ borderRadius: '8px' }}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Shredder size={16} />}
                        onClick={() => onDeleteContract(contract.id)}
                        disabled={contract.status === ContractStatus.TERMINATED}
                        fullWidth
                        sx={{ borderRadius: '8px', fontSize: '0.65rem' }}
                      >
                        {ContractStatusLabel.TERMINATED}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* FAB — chỉ hiện ở tab ACTIVE */}
          {statusFilter === ContractStatus.ACTIVE && (
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => handleOpenForm()}
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

          {/* Form Dialog (Create / Edit) */}
          <ContractFormDialog
            open={open}
            onClose={handleCloseForm}
            onSuccess={fetchContracts}
            editingContract={editingContract}
          />

          {/* Detail Dialog */}
          <ContractDetailDialog
            open={detailOpen}
            onClose={handleCloseDetail}
            contract={viewingContract}
            rooms={rooms}
            tenants={tenants}
            gradientIndex={viewingIndex}
            onEdit={handleOpenForm}
          />
        </div>
      }
    </>
  );
}
