import React from 'react';
import BottomNavigation from './BottomNavigation';
import AppHeader from './AppHeader';
import Notification from '../ui/Notification';

const Layout = ({ children, currentPage, onPageChange }) => {
  return (
    <div className="app-layout h-screen flex flex-col bg-slate-50 dark:bg-dark-900 transition-colors overflow-hidden">
      {/* App Header */}
      <AppHeader />
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden overscroll-none max-w-md mx-auto w-full">
        <div className="main-content h-full pb-20 overflow-y-auto overscroll-none">
          {children}
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        currentPage={currentPage} 
        onPageChange={onPageChange} 
      />
      
      {/* Notification Component */}
      <Notification />
    </div>
  );
};

export default Layout;