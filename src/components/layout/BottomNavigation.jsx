import React from 'react';

const BottomNavigation = ({ currentPage, onPageChange }) => {
  const navigationItems = [
    { id: 'workout', label: 'Workout', icon: '🏋️' },
    { id: 'templates', label: 'Templates', icon: '📋' },
    { id: 'history', label: 'History', icon: '📊' },
    { id: 'progress', label: 'Progress', icon: '📈' },
    { id: 'exercises', label: 'Exercises', icon: '🏋️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className="bottom-nav bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 px-2 py-1 pb-safe-bottom flex justify-around z-20 shadow-lg">
      {navigationItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onPageChange(item.id)}
          className={`nav-btn flex flex-col items-center gap-1 py-1 px-2 min-w-[60px] transition-colors ${
            currentPage === item.id 
              ? 'text-primary-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="nav-icon text-lg">{item.icon}</span>
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNavigation;