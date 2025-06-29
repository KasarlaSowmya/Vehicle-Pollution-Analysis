import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AddOwnerPage from './pages/AddOwnerPage';
import AddVehiclePage from './pages/AddVehiclePage';
import DashboardPage from './pages/DashboardPage';
import { OwnerProvider } from './context/OwnerContext';
import './App.css';

function App() {
  return (
    <OwnerProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/add-owner" element={<AddOwnerPage />} />
          <Route path="/add-vehicle" element={<AddVehiclePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </Router>
    </OwnerProvider>
  );
}

export default App;
