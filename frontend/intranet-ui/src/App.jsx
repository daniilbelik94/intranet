import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import GlobalStyles from './styles/GlobalStyles';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';

// Layouts
const MainLayout = lazy(() => import('./components/layout/MainLayout'));

// Common Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Authenticated Pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const EmployeeDirectoryPage = lazy(() => import('./pages/EmployeeDirectoryPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const NewsListPage = lazy(() => import('./pages/NewsListPage'));
const CreateNewsPage = lazy(() => import('./pages/CreateNewsPage'));
const MyNewsPage = lazy(() => import('./pages/MyNewsPage'));

// Компонент обертка для маршрутов, требующих инициализации AuthProvider
function AppRoutes() {
    const { authIsInitialized } = useAuth();

    if (!authIsInitialized) {
        // Показываем глобальный лоадер, пока AuthProvider инициализируется
        // Это может быть простой текст или более сложный компонент
        return <div>Инициализация приложения...</div>;
    }

    return (
        <Suspense fallback={<div>Загрузка страницы...</div>}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route 
                    path="/*" 
                    element={                            
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="employees" element={<EmployeeDirectoryPage />} />
                    <Route path="profile/:userId" element={<UserProfilePage />} />
                    <Route path="news" element={<NewsListPage />} />
                    <Route path="news/create" element={<CreateNewsPage />} />
                    <Route path="my-news" element={<MyNewsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

function ProtectedRoute({ children }) {
    // authIsInitialized здесь уже будет true, т.к. AppRoutes ждет этого
    // Теперь ProtectedRoute фокусируется только на isAuthenticated
    const { isAuthenticated } = useAuth(); 

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function App() {
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles />
            <Router>
                <AuthProvider> {/* AuthProvider теперь оборачивает AppRoutes */}
                    <AppRoutes />
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;
