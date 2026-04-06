import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-dark-bg font-sans text-ui-text">
      <Sidebar />
      <main className="flex-1 ml-[240px] flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 animate-fade-in relative z-10 w-full overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
