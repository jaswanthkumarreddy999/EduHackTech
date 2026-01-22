// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext'; // 1. Import AuthProvider

// Components
import Navbar from './components/common/Navbar';
import LandingPage from './modules/landing/LandingPage';
import Login from './modules/auth/pages/Login';

// Wrapper to hide Navbar on Login page
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login';
  
  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    /* 2. Wrap everything in AuthProvider so user state is available globally */
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;