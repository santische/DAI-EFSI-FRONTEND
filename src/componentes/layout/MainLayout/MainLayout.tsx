import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import Reproductor from '../../musica/Reproductor';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="layout-content">
        <Navbar />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
      <Reproductor />
    </div>
  );
};

export default MainLayout;