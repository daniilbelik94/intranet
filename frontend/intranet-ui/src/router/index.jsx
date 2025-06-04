import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App'; // Главный компонент приложения, может содержать общую разметку
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegistrationPage from '../pages/RegistrationPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute'; // Импортируем ProtectedRoute
import NewsListPage from '../pages/NewsListPage'; // Импортируем страницу списка новостей
import CreateNewsPage from '../pages/CreateNewsPage'; // Импортируем страницу создания новости
import EmployeeDirectoryPage from '../pages/EmployeeDirectoryPage'; // Импортируем страницу справочника
// import NewsDetailPage from '../pages/NewsDetailPage'; // Больше не используем

// TODO: Добавить ProtectedRoute компонент для защищенных маршрутов

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />, // Глобальный обработчик ошибок для этого дерева маршрутов
    children: [
      // Защищенные маршруты
      {
        element: <ProtectedRoute />,
        children: [
          {
            index: true, // Главная страница по пути '/'
            element: <HomePage />,
          },
          {
            path: "news", // Базовый путь для всех новостных маршрутов
            // Можно здесь оставить общий элемент-обертку для новостей, если он нужен,
            // либо просто использовать его как группировку
            children: [
              {
                index: true, // /news -> NewsListPage
                element: <NewsListPage />,
              },
              {
                path: "create", // /news/create -> CreateNewsPage
                element: <CreateNewsPage />,
              },
              // {
              //   path: ":itemId", // /news/:itemId -> NewsDetailPage
              //   element: <NewsDetailPage />,
              // }, // Маршрут удален
            ]
          },
          {
            path: "directory", // Новый маршрут для справочника сотрудников
            element: <EmployeeDirectoryPage />,
          },
          // TODO: Добавить другие ЗАЩИЩЕННЫЕ маршруты здесь
          // Например, /dashboard, /profile, и т.д.
        ],
      },
      // Публичные маршруты (если есть еще какие-то внутри App layout, но обычно их нет)
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegistrationPage />,
  },
  // Можно добавить отдельный layout для страниц, не требующих общей навигации, если нужно
  // {
  //   path: "*", // Перехват всех остальных маршрутов (404)
  //   element: <NotFoundPage /> // Лучше обрабатывать 404 через errorElement в корневом маршруте
  // }
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter; 