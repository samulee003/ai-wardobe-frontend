import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const HeaderContainer = styled.header`
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    color: #0056b3;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 30px;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 15px;
  }
`;

const NavLink = styled(Link)`
  color: #333;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background: #f8f9fa;
    color: #007bff;
  }
  
  &.active {
    background: #007bff;
    color: white;
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 14px;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserName = styled.span`
  color: #666;
  font-size: 14px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const LogoutButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #c82333;
  }
`;

const LoginButton = styled(Link)`
  background: #007bff;
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #0056b3;
  }
`;

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          🧥 智能衣櫃
        </Logo>

        {isAuthenticated && (
          <Nav>
            <NavLink 
              to="/" 
              className={isActive('/') ? 'active' : ''}
            >
              🏠 首頁
            </NavLink>
            <NavLink 
              to="/upload" 
              className={isActive('/upload') ? 'active' : ''}
            >
              📷 上傳
            </NavLink>
            <NavLink 
              to="/wardrobe" 
              className={isActive('/wardrobe') ? 'active' : ''}
            >
              👔 衣櫃
            </NavLink>
            <NavLink 
              to="/outfits" 
              className={isActive('/outfits') ? 'active' : ''}
            >
              ✨ 穿搭
            </NavLink>
            <NavLink 
              to="/statistics" 
              className={isActive('/statistics') ? 'active' : ''}
            >
              📊 統計
            </NavLink>
            <NavLink 
              to="/settings" 
              className={isActive('/settings') ? 'active' : ''}
            >
              ⚙️ 設定
            </NavLink>
            <NavLink 
              to="/declutter" 
              className={isActive('/declutter') ? 'active' : ''}
            >
              🗑️ 整理
            </NavLink>
          </Nav>
        )}

        <UserSection>
          {isAuthenticated ? (
            <>
              <UserName>
                👋 {user?.name || '用戶'}
              </UserName>
              <LogoutButton onClick={handleLogout}>
                登出
              </LogoutButton>
            </>
          ) : (
            <LoginButton to="/login">
              登錄
            </LoginButton>
          )}
        </UserSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;