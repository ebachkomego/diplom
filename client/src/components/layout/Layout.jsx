import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import '../../styles/layout.css';

const Layout = () => {
  return (
    <div className="app-layout">
      <div className="vibrant-blob"></div>
      <div className="extra-blob-1"></div>
      <div className="extra-blob-2"></div>
      <Sidebar />
      <div className="main-content-wrapper">
        <Header />
        <main className="main-content">
          <div className="content-container animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
