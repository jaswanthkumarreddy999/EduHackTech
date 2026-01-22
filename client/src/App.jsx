// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

// Components
import Navbar from "./components/common/Navbar";
import LandingPage from "./modules/landing/LandingPage";
import Login from "./modules/auth/pages/Login";
import Learning from "./modules/learning/learning";
import CoursePage from "./modules/learning/coursepage";
import Payment from "./modules/learning/payment";

// Wrapper to hide Navbar on Login page
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* HOME -> Learning */}
              <Route path="/" element={<Learning />} />

              {/* Learning Page */}
              <Route path="/learning" element={<Learning />} />

              {/* Login */}
              <Route path="/login" element={<Login />} />

              {/* Optional Landing */}
              <Route path="/landing" element={<LandingPage />} />

              {/* Course Detail Page */}
              <Route path="/course/:id" element={<CoursePage />} />

              {/* ✅ Payment Page (REQUIRES ID) */}
              <Route path="/payment/:id" element={<Payment />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
