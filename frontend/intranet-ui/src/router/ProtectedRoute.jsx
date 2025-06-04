import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import styled from 'styled-components';

// Можно добавить простой компонент загрузчика, пока проверяется состояние аутентификации
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  font-size: 1.5rem;
  color: #1d1d1f;
`;

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    // Пока контекст не инициализирован (например, проверка localStorage),
    // показываем заглушку или ничего не рендерим, чтобы избежать моргания
    return <LoadingOverlay>Загрузка...</LoadingOverlay>; // Или null, или другой спиннер
  }

  if (!isAuthenticated) {
    // Если пользователь не аутентифицирован, перенаправляем на страницу входа
    // Сохраняем текущий путь, чтобы вернуться на него после входа
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Проверка ролей, если `allowedRoles` передан
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Если роль пользователя не входит в список разрешенных,
    // можно перенаправить на страницу "Доступ запрещен" (403) или на главную
    // Пока просто перенаправим на главную как fallback
    console.warn(`User role '${user.role}' is not allowed for this route. Redirecting.`);
    return <Navigate to="/" replace />;
    // Или: return <Navigate to="/unauthorized" replace />;
  }

  // Если пользователь аутентифицирован (и имеет нужную роль, если проверка есть),
  // отображаем дочерний компонент (страницу)
  return <Outlet />; // Outlet будет рендерить дочерние маршруты, определенные в AppRouter
};

export default ProtectedRoute; 