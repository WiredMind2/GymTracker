import React, { useState, useEffect } from 'react';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  // Global notification function
  useEffect(() => {
    const showNotification = (message, type = 'info') => {
      const id = Date.now();
      const notification = {
        id,
        message,
        type,
        timestamp: new Date()
      };
      
      setNotifications(prev => [...prev, notification]);
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 3000);
    };

    // Make it globally available
    window.showNotification = showNotification;
    
    return () => {
      delete window.showNotification;
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationStyle(notification.type)} text-white p-3 rounded-lg shadow-lg max-w-xs animate-slide-in`}
        >
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;