import { useState, useEffect } from 'react';
import { Button, Card, CardContent, Fab } from '@mui/material';
import { Plus, Edit, Trash2, FileSignature, Calendar, DollarSign, Users } from 'lucide-react';
import Header from '../../../shared/components/ui/Header';
import Loading from '../../../shared/components/ui/Loading';
import { ContractService } from '../services/ContractService';

export function ContractListPage({ onViewChange }) {
  const [loading, setLoading] = useState(true);
  // const [contracts, setContracts] = useState([]);

  // const fetchContracts = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await ContractService.getContracts();

  //     if (response.success) {
  //       setContracts(response.data);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchContracts();
  // }, []);

  // const handleOpen = (contract) => {
  //   // TODO: Mở form thêm/sửa hợp đồng
  //   console.log("Open form for:", contract);
  // };

  // const onDeleteContract = async (id) => {
  //   // TODO: Xóa hợp đồng / Chấm dứt hợp đồng
  //   console.log("Delete contract:", id);
  // };

  // const gradients = [
  //   'from-emerald-400 to-teal-500',
  //   'from-cyan-400 to-blue-500',
  //   'from-violet-400 to-fuchsia-500',
  //   'from-amber-400 to-orange-500',
  //   'from-rose-400 to-red-500',
  // ];

  return (
    <>
      {loading ? <Loading /> :
        <div className="p-4 pb-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
          <Header title={"Hợp đồng"} description={`${contracts.length} hợp đồng`} onViewChange={onViewChange} />

          {/* <div className="grid grid-cols-1 gap-4">
            {contracts.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Chưa có hợp đồng nào.</div>
            ) : contracts.map((contract, index) => (
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
                        <h3 className="text-lg font-medium">Hợp đồng phòng {contract.roomId}</h3>
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
                      icon={<DollarSign size={18} className="text-emerald-600" />}
                      label="Tiền cọc"
                      value={`${contract.depositAmount?.toLocaleString()}đ`}
                    />

                    <InfoItem
                      icon={<DollarSign size={18} className="text-blue-600" />}
                      label="Giá thuê"
                      value={`${contract.monthlyRent?.toLocaleString()}đ/tháng`}
                    />

                    <InfoItem
                      icon={<Calendar size={18} className="text-indigo-600" />}
                      label="Ngày bắt đầu"
                      value={contract.startDate ? new Date(contract.startDate.toDate ? contract.startDate.toDate() : contract.startDate).toLocaleDateString('vi-VN') : '---'}
                    />

                    <RoomInfoItem
                      icon={<Users size={18} className="text-orange-600" />}
                      label="Đại diện"
                      value={contract.representativeTenantId || '---'}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Edit size={16} />}
                      onClick={() => handleOpen(contract)}
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
                      onClick={() => onDeleteContract(contract.id)}
                      fullWidth
                      sx={{ borderRadius: '8px' }}
                    >
                      Kết thúc
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div> */}

          {/* <Fab
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
          </Fab> */}
        </div>
      }
    </>
  );
}
