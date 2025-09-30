// 📁 src/RootApp.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App'; // main dashboard
import LoginPage from './pages/LoginForm';
import RegisterPage from './pages/RegisterForm';
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute';

const RootApp: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/App" element={<PrivateRoute><App /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootApp;
