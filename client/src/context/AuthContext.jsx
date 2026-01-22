import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from "jwt-decode"; // You need to install this: npm install jwt-decode

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check Session on Load (The "Persist" Logic)
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      try {
        // SECURITY CHECK: Is the token expired?
        const decoded = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          // Token Expired -> Force Logout
          console.warn("Session expired. Logging out...");
          logoutUser();
        } else {
          // Token Valid -> Restore Session
          setUser(JSON.parse(storedUser));
          // Optional: You could verify the token with the backend here for extra security
        }
      } catch (error) {
        // Token invalid/corrupted -> Force Logout
        logoutUser();
      }
    }
    setLoading(false);
  }, []);

  // 2. Login Action
  const loginUser = (userData, token) => {
    // Save to State
    setUser(userData);
    
    // Save to Browser Storage (Persistence)
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(userData));
  };

  // 3. Logout Action
  const logoutUser = () => {
    // Clear State
    setUser(null);
    
    // Clear Storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    // Optional: Redirect to login if needed
    // window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);