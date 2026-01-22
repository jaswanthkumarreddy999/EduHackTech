import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

// Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import LandingPage from "./modules/landing/LandingPage";
import Login from "./modules/auth/pages/Login";
import Learning from "./modules/learning/learning";
import CoursePage from "./modules/learning/coursepage";
import HackathonList from "./modules/competition/pages/HackathonList";

// Wrapper to hide Navbar on Login page
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
      {!hideNavbar && <Footer />}
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
              {/* Home shows Learning */}
              <Route path="/" element={<Learning />} />

              {/* ✅ THIS WAS MISSING */}
              <Route path="/learning" element={<Learning />} />

              <Route path="/login" element={<Login />} />

              {/* Competition */}
              <Route path="/competition" element={<HackathonList />} />

              {/* Old Landing (Optional) */}
              <Route path="/landing" element={<LandingPage />} />

              {/* Course Detail */}
              <Route path="/course/:id" element={<CoursePage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;