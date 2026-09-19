import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardContent, Fab, Chip } from '@mui/material';
import { Plus, Edit, Trash2, Building2, MapPin, Home, Eye } from 'lucide-react';
import Loading, { SkeletonList } from '../../../shared/components/ui/Loading';
import { PropertiesService } from '../service/PropertiesService';
import { useNotification } from '../../../shared/hooks/useNotification';
import InfoItem from '../../../shared/components/ui/InfoItem';
import { PROPERTY_STATUS } from '../dto/PropertyDTO';
import { PropertyFormDialog } from '../components/PropertyFormDialog';
import { PropertyDetailDialog } from '../components/PropertyDetailDialog';

export function PropertyListPage({ setHeaderConfig }) {
  const [initialLoading, setInitialLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const isFirstLoad = useRef(true);
  const { showSuccess, showError } = useNotification();

  const [open, setOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingProperty, setViewingProperty] = useState(null);

  const fetchProperties = useCallback(async () => {
    try {
      if (isFirstLoad.current) {
        setInitialLoading(true);
      } else {
        setListLoading(true);
      }

      const response = await PropertiesService.getProperties();

      if (response.success) {
        setProperties(response.data);
        if (setHeaderConfig) {
          setHeaderConfig({
            title: "Khu trọ",
            description: `${response.data.length} khu trọ`,
          });
        }
      } else {
        showError(response.error || 'Không thể tải dữ liệu');
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
    } finally {
      setInitialLoading(false);
      setListLoading(false);
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
      }
    }
  }, [setHeaderConfig, showError]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleOpen = useCallback((property = null) => {
    setEditingProperty(property);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditingProperty(null);
  }, []);

  const handleOpenDetail = useCallback((property) => {
    setViewingProperty(property);
    setDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setViewingProperty(null);
  }, []);

  const handleDelete = useCallback(async (propertyId) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa khu trọ này không? Tất cả phòng thuộc khu trọ này sẽ bị ẩn."
    );

    if (!confirmed) return;

    const response = await PropertiesService.softDeleteProperty(propertyId);

    if (response.success) {
      showSuccess("Xóa khu trọ thành công");
      await fetchProperties();
    } else {
      showError(response.error || 'Không thể xóa khu trọ');
    }
  }, [fetchProperties, showSuccess, showError]);

  const calculateOccupancyRate = useCallback((property) => {
    if (property.roomCount === 0) return 0;
    return Math.round((property.occupiedRoomCount / property.roomCount) * 100);
  }, []);

  const renderPropertyList = () => {
    if (listLoading) {
      return [<SkeletonList key="skeleton" count={3} />];
    }

    if (properties.length === 0) {
      return [
        <div key="empty" className="text-center py-10 text-gray-500">
          <Building2 size={48} className="mx-auto mb-3 text-gray-300" />
          <p>Chưa có khu trọ nào.</p>
          <p className="text-sm mt-2">Nhấn nút "+" để thêm khu trọ đầu tiên</p>
        </div>
      ];
    }

    return properties.map((property) => {
                const statusConfig = PROPERTY_STATUS[property.status] || PROPERTY_STATUS.ACTIVE;
                const occupancyRate = calculateOccupancyRate(property);
                
                return (
                  <Card
                    key={property.id}
                    sx={{
                      borderRadius: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                    }}
                  >
                    <div className={`bg-gradient-to-r ${statusConfig.bgGradient} p-4 text-white`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Building2 size={24} />
                          <div>
                            <h3 className="text-xl font-semibold">{property.name}</h3>
                            {property.address && (
                              <div className="flex items-center gap-1 text-sm opacity-90 mt-1">
                                <MapPin size={14} />
                                <p className="line-clamp-1">{property.address}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Chip
                          label={statusConfig.label}
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
                          label="Tổng số phòng"
                          value={property.roomCount || 0}
                          icon={<Home size={16} />}
                        />
                        <InfoItem
                          label="Đang thuê"
                          value={`${property.occupiedRoomCount || 0}/${property.roomCount || 0}`}
                          icon={<Home size={16} />}
                        />
                      </div>

                      {/* Occupancy Rate Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">Tỷ lệ lấp đầy</span>
                          <span className="text-sm font-semibold text-indigo-600">
                            {occupancyRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${occupancyRate}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Eye size={16} />}
                          onClick={() => handleOpenDetail(property)}
                          fullWidth
                          sx={{ borderRadius: '8px' }}
                        >
                          Xem
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          startIcon={<Edit size={16} />}
                          onClick={() => handleOpen(property)}
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
                          onClick={() => handleDelete(property.id)}
                          fullWidth
                          sx={{ borderRadius: '8px' }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              });
  };

  return (
    <>
      {initialLoading ? (
        <Loading />
      ) : (
        <div className="p-4 pb-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen" style={{ paddingTop: '56px' }}>
          <div className="grid grid-cols-1 gap-4">
            {renderPropertyList()}
          </div>

          <Fab
            color="primary"
            aria-label="add property"
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

          <PropertyFormDialog
            open={open}
            editingProperty={editingProperty}
            onClose={handleClose}
            onSuccess={fetchProperties}
          />

          <PropertyDetailDialog
            open={detailOpen}
            onClose={handleCloseDetail}
            property={viewingProperty}
            onEdit={handleOpen}
          />
        </div>
      )}
    </>
  );
}

PropertyListPage.propTypes = {
  setHeaderConfig: PropTypes.func,
};
