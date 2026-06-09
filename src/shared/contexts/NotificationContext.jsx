import React, { createContext, useState, useCallback, createRef } from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import { X } from 'lucide-react';

export const NotificationContext = createContext(null);
export const notificationRef = createRef();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'info', // 'success' | 'error' | 'warning' | 'info'
  });

  const showNotification = useCallback((message, type) => {
    setNotification({
      open: true,
      message,
      type,
    });
  }, []);

  const handleClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  const showSuccess = useCallback((message) => {
    showNotification(message, 'success');
  }, [showNotification]);

  const showWarning = useCallback((message) => {
    showNotification(message, 'warning');
  }, [showNotification]);

  const showInfo = useCallback((message) => {
    showNotification(message, 'info');
  }, [showNotification]);

  const showError = useCallback((error) => {
    let errorMessage = 'Đã xảy ra lỗi không xác định.';

    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.response?.data?.message) {
      // Handle REST API (Axios) errors
      errorMessage = error.response.data.message;
    } else if (error?.code) {
      // Handle Firebase errors
      // You can add more specific mappings here
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Người dùng không tồn tại.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mật khẩu không đúng.';
          break;
        case 'permission-denied':
          errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
    } else if (error?.message) {
      // Standard JS Error
      errorMessage = error.message;
    }

    console.error('[Global Error]:', error);
    showNotification(errorMessage, 'error');
  }, [showNotification]);

  const contextValue = {
    showSuccess,
    showWarning,
    showInfo,
    showError,
  };

  // Attach to ref for use outside of React components (e.g. Services)
  if (!notificationRef.current) {
    notificationRef.current = contextValue;
  } else {
    Object.assign(notificationRef.current, contextValue);
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={notification.open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={notification.type}
          variant="filled"
          sx={{ width: '100%', boxShadow: 3, borderRadius: '8px' }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <X size={20} />
            </IconButton>
          }
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
