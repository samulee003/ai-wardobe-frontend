import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Home from './pages/Home';
import Upload from './pages/Upload';
import MobileUpload from './pages/MobileUpload';
import Wardrobe from './pages/Wardrobe';
import Outfits from './pages/Outfits';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Declutter from './pages/Declutter';
import Items from './pages/Items';
import ItemCategory from './pages/ItemCategory';
import OutfitCategory from './pages/OutfitCategory';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ADHDModeToggle from './components/ADHDModeToggle';
import SyncStatus from './components/SyncStatus';
import ToastProvider from './components/Toast';
import UpdateNotification from './components/UpdateNotification';

import './App.css';
import GlobalStyle from './styles/GlobalStyle';
import FAB from './components/ui/FAB';
import analyticsService from './services/analyticsService';

function App() {
  useEffect(() => {
    analyticsService.initialize();
  }, []);

  function Layout() {
    const location = useLocation();
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const mobileShellRoutes = ['/items', '/wardrobe', '/outfits', '/settings'];
    const usesMobileShell = isMobile && mobileShellRoutes.some((p) => location.pathname.startsWith(p));

    return (
      <div className="App">
        <ErrorBoundary>
          {!usesMobileShell && <Header />}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/upload"
                element={
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                    ? <MobileUpload />
                    : <Upload />
                }
              />
              <Route path="/wardrobe" element={<Wardrobe />} />
              <Route path="/items" element={<Items />} />
              <Route path="/items/:category" element={<ItemCategory />} />
              <Route path="/outfits" element={<Outfits />} />
              <Route path="/outfits/:category" element={<OutfitCategory />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/declutter" element={<Declutter />} />
            </Routes>
          </main>
          {!usesMobileShell && <FAB onClick={() => window.location.assign('/upload')} />}
          <ADHDModeToggle />
          <SyncStatus />
          <UpdateNotification />
        </ErrorBoundary>
        <GlobalStyle />
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
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
}

export default App;