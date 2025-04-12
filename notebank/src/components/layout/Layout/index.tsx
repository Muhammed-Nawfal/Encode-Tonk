// src/components/layout/Layout/index.tsx
import React from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';
import type { LayoutProps } from './types';

/**
 * Main layout component that wraps the application content
 */
function Layout({ children, sidebarProps = {} }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar {...sidebarProps} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;