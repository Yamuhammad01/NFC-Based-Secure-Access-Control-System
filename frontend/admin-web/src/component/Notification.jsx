import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Notification = ({ 
  type = 'info', 
  message, 
  isVisible, 
  onClose, 
  autoClose = true, 
  duration = 4000 
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, autoClose, duration]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for animation to complete
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: <FaCheckCircle className="w-5 h-5 text-green-600" />,
          progressBar: 'bg-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: <FaExclamationTriangle className="w-5 h-5 text-red-600" />,
          progressBar: 'bg-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />,
          progressBar: 'bg-yellow-500'
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: <FaInfoCircle className="w-5 h-5 text-blue-600" />,
          progressBar: 'bg-blue-500'
        };
    }
  };

  const styles = getTypeStyles();

  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
      show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`${styles.bg} border rounded-lg shadow-lg p-4 relative overflow-hidden`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${styles.text}`}>
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`flex-shrink-0 ${styles.text} hover:opacity-70 transition-opacity`}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
        
        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
            <div 
              className={`h-full ${styles.progressBar} transition-all ease-linear`}
              style={{
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Hook for managing notifications
export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message, options = {}) => {
    setNotification({
      type,
      message,
      isVisible: true,
      ...options
    });
  };

  const hideNotification = () => {
    setNotification(prev => prev ? { ...prev, isVisible: false } : null);
  };

  const clearNotification = () => {
    setNotification(null);
  };

  return {
    notification,
    showNotification,
    hideNotification,
    clearNotification,
    showSuccess: (message, options) => showNotification('success', message, options),
    showError: (message, options) => showNotification('error', message, options),
    showWarning: (message, options) => showNotification('warning', message, options),
    showInfo: (message, options) => showNotification('info', message, options),
  };
};

export default Notification;
