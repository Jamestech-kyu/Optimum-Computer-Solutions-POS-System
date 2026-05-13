import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now(); // unique ID for each notification
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const success = (msg) => addNotification(msg, 'success');
  const error   = (msg) => addNotification(msg, 'error');
  const info    = (msg) => addNotification(msg, 'info');

  return (
    <NotificationContext.Provider value={{ success, error, info }}>
      {children}

      {/* Toast messages appear in the top-right corner */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`
              px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium
              animate-fade-in
              ${n.type === 'success' ? 'bg-green-600' : ''}
              ${n.type === 'error'   ? 'bg-accent-500' : ''}
              ${n.type === 'info'    ? 'bg-primary-700' : ''}
            `}
          >
            {n.type === 'success' && '✅ '}
            {n.type === 'error'   && '❌ '}
            {n.type === 'info'    && 'ℹ️ '}
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}