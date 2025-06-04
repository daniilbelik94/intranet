import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate, NavLink as RouterNavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';

const HeaderContainer = styled.header`
  background-color: var(--color-background-elevated, #ffffff);
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border, #d1d1d6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const LogoLink = styled(Link)`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  text-decoration: none;
`;

const NavContainer = styled.nav`
  display: flex;
  align-items: center;
`;

const StyledNavLink = styled(RouterNavLink)`
  color: var(--color-text-secondary);
  text-decoration: none;
  margin-right: 20px;
  font-size: 0.9rem;
  padding: 5px 0;
  position: relative;

  &:hover {
    color: var(--color-apple-blue);
  }

  &.active {
    color: var(--color-apple-blue);
    font-weight: 500;
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--color-apple-blue);
    }
  }
`;

const UserInfo = styled.span`
  margin-right: 20px;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  font-size: 0.9rem;
  color: var(--color-apple-blue);
  background-color: transparent;
  border: 1px solid var(--color-apple-blue);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-apple-blue);
    color: #fff;
  }
`;

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <HeaderContainer>
      <LogoLink to={isAuthenticated ? "/" : "/login"}>Intranet</LogoLink>
      {isAuthenticated && user && (
        <NavContainer>
          <StyledNavLink to="/dashboard">Главная</StyledNavLink>
          <StyledNavLink to="/news">Новости</StyledNavLink>
          <StyledNavLink to="/employees">Сотрудники</StyledNavLink>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <UserInfo>Привет, {user.fullName || user.email}!</UserInfo>
            <LogoutButton onClick={handleLogout}>Выход</LogoutButton>
          </div>
        </NavContainer>
      )}
    </HeaderContainer>
  );
};

export default Header; 