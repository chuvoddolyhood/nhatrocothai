import { useState, useEffect } from 'react';
import { Button, Card, CardContent, Fab } from '@mui/material';
import { Plus, Edit, Trash2, User, Phone, CreditCard, Calendar, MapPin } from 'lucide-react';
import Loading from '../../../shared/components/ui/Loading';
import { TenantService } from '../services/TenantService';
import { TenantFormDialog } from '../components/TenantFormDialog';
import InfoItem from '../../../shared/components/ui/InfoItem';
import { TenantStatusLabel } from '../constants/TenantStatus';

export function TenantListPage({ setHeaderConfig }) {
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);

  const [open, setOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await TenantService.getTenants();

      if (response.success) {
        setTenants(response.data);
        setHeaderConfig({
          title: "Khách thuê",
          description: `${response.data.length} khách thuê`
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleOpen = (tenant) => {
    setEditingTenant(tenant || null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTenant(null);
  };

  const handleSubmit = async (formData) => {
    if (editingTenant) {
      await TenantService.updateTenant(editingTenant.id, formData);
    } else {
      await TenantService.addTenant(formData);
    }
    fetchTenants();
    handleClose();
  };

  const onDeleteTenant = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách thuê này?')) {
      await TenantService.softDeleteTenant(id);
      fetchTenants();
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
      {loading ? <Loading /> :
        <div className="p-4 pb-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">

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
                        <h3 className="text-lg font-medium">
                          <span className="block max-w-[250px] truncate">
                            {tenant.fullName}</span>
                        </h3>
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
                      {TenantStatusLabel.MOVED_OUT}
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

          <TenantFormDialog
            open={open}
            onClose={handleClose}
            onSubmit={handleSubmit}
            initialData={editingTenant ? {
              fullName: editingTenant.fullName || '',
              phone: editingTenant.phone || '',
              citizenId: editingTenant.citizenId || '',
              birthDate: editingTenant.birthDate || '',
              permanentAddress: editingTenant.permanentAddress || '',
            } : null}
          />
        </div>
      }
    </>
  );
}
