import React, { useState, useEffect } from 'react';
import { Bell, Clock } from 'lucide-react';
import { Badge } from './ui/badge';

export function TopHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationCount, setNotificationCount] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <div />
      
      {/* Right side - Time and Notifications */}
      <div className="flex items-center gap-6">
        {/* Current Time Display */}
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-4 h-4" />
          <div className="text-sm">
            <div className="font-semibold text-base">{formatTime(currentTime)}</div>
            <div className="text-xs text-gray-500">{formatDate(currentTime)}</div>
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <Badge 
                variant="default" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
