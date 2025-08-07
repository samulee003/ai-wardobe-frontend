import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Home from './pages/Home';
import Upload from './pages/Upload';
import MobileUpload from './pages/MobileUpload';
import Wardrobe from './pages/Wardrobe';
import Outfits from './pages/Outfits';
import Statistics from './pages/Statistics';
import Login from './pages/Login';
import Declutter from './pages/Declutter';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ADHDModeToggle from './components/ADHDModeToggle';
import SyncStatus from './components/SyncStatus';
import ToastProvider from './components/Toast';
import UpdateNotification from './components/UpdateNotification';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ErrorBoundary>
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/upload" element={
              /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                ? <MobileUpload /> 
                : <Upload />
            } />
                <Route path="/wardrobe" element={<Wardrobe />} />
                <Route path="/outfits" element={<Outfits />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/declutter" element={<Declutter />} />
              </Routes>
            </main>
            <ADHDModeToggle />
            <SyncStatus />
            <UpdateNotification />
          </ErrorBoundary>
          <ToastProvider />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;