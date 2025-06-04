// Это будет файл frontend/intranet-ui/src/features/auth/context/AuthContext.jsx
// Пока что он пустой, мы наполним его на следующих шагах. 

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import * as authService from '../services/authService'; // Импортируем сервис

// --- 1. Типы Действий (Action Types) ---
const ACTION_TYPES = {
  INITIALIZE: 'INITIALIZE',
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_REQUEST: 'REGISTER_REQUEST',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER', // Может понадобиться для обновления данных пользователя
  INITIALIZATION_FAILURE: 'INITIALIZATION_FAILURE', // Для случая, когда токен есть, но он невалиден
};

// --- 2. Начальное Состояние (Initial State) ---
const initialState = {
  isAuthenticated: false,
  isInitialized: false, // Для проверки, была ли попытка восстановить сессию из localStorage
  isLoading: false, // Для отслеживания состояния запросов login/register
  user: null, // { id, email, fullName, role, etc. }
  token: null,
  error: null, // Для хранения сообщений об ошибках
};

// --- 3. Редьюсер (Auth Reducer) ---
const authReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.INITIALIZE:
      return {
        ...state,
        isInitialized: true,
        isAuthenticated: !!action.payload.token,
        user: action.payload.user || null,
        token: action.payload.token || null,
        error: null, // Сбрасываем ошибку при успешной инициализации
      };
    case ACTION_TYPES.INITIALIZATION_FAILURE: // Обработка неудачной инициализации
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      return {
        ...state,
        isInitialized: true,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload.error,
      };
    case ACTION_TYPES.LOGIN_REQUEST:
    case ACTION_TYPES.REGISTER_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case ACTION_TYPES.LOGIN_SUCCESS:
    case ACTION_TYPES.REGISTER_SUCCESS:
      localStorage.setItem('authToken', action.payload.token);
      localStorage.setItem('authUser', JSON.stringify(action.payload.user));
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case ACTION_TYPES.LOGIN_FAILURE:
    case ACTION_TYPES.REGISTER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
        isAuthenticated: false, // Убедимся, что пользователь не аутентифицирован при ошибке
        user: null,
        token: null,
      };
    case ACTION_TYPES.LOGOUT:
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      return {
        ...initialState,
        isInitialized: true,
        isAuthenticated: false,
      };
    case ACTION_TYPES.SET_USER:
      localStorage.setItem('authUser', JSON.stringify(action.payload.user));
      return {
        ...state,
        user: action.payload.user,
      };
    default:
      return state;
  }
};

// --- 4. Создание Auth Context ---
const AuthContext = createContext(initialState);

// --- 5. Создание Auth Provider ---
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[AuthContext] Initializing authentication...');
      const token = localStorage.getItem('authToken');
      console.log('[AuthContext] Token from localStorage:', token);

      if (token) {
        try {
          console.log('[AuthContext] Token found, attempting to get current user...');
          const userDataFromApi = await authService.getCurrentUser(token);
          console.log('[AuthContext] User data from API:', userDataFromApi);
          
          const user = {
            id: userDataFromApi.id,
            email: userDataFromApi.email,
            fullName: userDataFromApi.full_name, 
            is_active: userDataFromApi.is_active,
            is_superuser: userDataFromApi.is_superuser
          };
          console.log('[AuthContext] Dispatching INITIALIZE with token and user:', { token, user });
          dispatch({ type: ACTION_TYPES.INITIALIZE, payload: { token, user } });
        } catch (error) {
          console.error("[AuthContext] Error during getCurrentUser or data mapping:", error);
          console.log('[AuthContext] Dispatching INITIALIZATION_FAILURE due to error.');
          dispatch({ type: ACTION_TYPES.INITIALIZATION_FAILURE, payload: { error: 'Failed to initialize session: ' + (error.message || 'Unknown error') } });
        }
      } else {
        console.log('[AuthContext] No token found in localStorage. Dispatching INITIALIZE with null token/user.');
        dispatch({ type: ACTION_TYPES.INITIALIZE, payload: { token: null, user: null } });
      }
    };

    initializeAuth();
  }, []);

  const login = React.useCallback(async (email, password) => {
    dispatch({ type: ACTION_TYPES.LOGIN_REQUEST });
    try {
      const data = await authService.login(email, password); 
      
      let userToDispatch = null;
      if (data.access_token) {
        try {
          const userDataFromApi = await authService.getCurrentUser(data.access_token);
          userToDispatch = {
            id: userDataFromApi.id,
            email: userDataFromApi.email,
            fullName: userDataFromApi.full_name,
            is_active: userDataFromApi.is_active,
            is_superuser: userDataFromApi.is_superuser
          };
        } catch (e) {
          console.error("Failed to fetch user after login, will rely on INITIALIZE later", e);
        }
      }

      dispatch({ 
        type: ACTION_TYPES.LOGIN_SUCCESS, 
        payload: { user: userToDispatch, token: data.access_token } 
      });
      return { success: true, user: userToDispatch };
    } catch (error) {
      const errorMessage = error.message || 'Ошибка входа';
      dispatch({ type: ACTION_TYPES.LOGIN_FAILURE, payload: { error: errorMessage } });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const register = React.useCallback(async (fullName, email, password) => {
    dispatch({ type: ACTION_TYPES.REGISTER_REQUEST });
    try {
      const registeredUser = await authService.register(fullName, email, password);
      // registeredUser содержит { id, email, full_name, is_active, is_superuser }
      // Бэкенд при регистрации создает обычного пользователя (is_superuser=False)

      // После успешной регистрации автоматически логиним пользователя, чтобы получить токен
      // и полные данные пользователя, включая is_superuser (хотя мы знаем, что оно будет false)
      const loginData = await authService.login(email, password); 
      
      let userForState = null;
      if (loginData.access_token) {
          try {
            const userDataFromApi = await authService.getCurrentUser(loginData.access_token);
            userForState = {
                id: userDataFromApi.id,
                email: userDataFromApi.email,
                fullName: userDataFromApi.full_name,
                is_active: userDataFromApi.is_active,
                is_superuser: userDataFromApi.is_superuser 
            };
          } catch (e) {
            console.error("Failed to fetch user after register/auto-login", e);
            // Fallback to registeredUser data if getCurrentUser fails, though is_superuser might be missing/defaulted
            userForState = {
                id: registeredUser.id,
                email: registeredUser.email,
                fullName: registeredUser.full_name,
                is_active: registeredUser.is_active,
                is_superuser: registeredUser.is_superuser || false // Default to false
            };
          }
      } else {
          // Should not happen if login call was successful in authService
           userForState = {
                id: registeredUser.id,
                email: registeredUser.email,
                fullName: registeredUser.full_name,
                is_active: registeredUser.is_active,
                is_superuser: registeredUser.is_superuser || false
            };
      }


      dispatch({ 
          type: ACTION_TYPES.REGISTER_SUCCESS, 
          payload: { user: userForState, token: loginData.access_token } 
      });
      return { success: true, user: userForState };

    } catch (error) {
      const errorMessage = error.message || 'Ошибка регистрации или автоматического входа';
      dispatch({ type: ACTION_TYPES.REGISTER_FAILURE, payload: { error: errorMessage } });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const logout = React.useCallback(() => {
    dispatch({ type: ACTION_TYPES.LOGOUT });
    // TODO: Вызвать API для инвалидации токена на бэкенде, если такой эндпоинт есть
    // await authService.logout(state.token); // Если это будет раскомментировано, нужно добавить state.token в зависимости useCallback
  }, [dispatch]);

  const setUser = React.useCallback((userData) => { // userData должен соответствовать структуре user в state
    dispatch({ type: ACTION_TYPES.SET_USER, payload: { user: userData } });
  }, [dispatch]);

  const contextValue = React.useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    setUser,
  }), [state, login, register, logout, setUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// --- 6. Хук для использования контекста ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Явно выделяем состояния для удобства
  return {
    ...context,
    isLoading: context.isLoading, // Переименовываем для ясности, это isLoading для операций login/register
    authIsInitialized: context.isInitialized, // Это состояние говорит нам, что AuthProvider завершил попытку инициализации
    isAuthenticated: context.isAuthenticated,
    user: context.user,
    token: context.token,
    error: context.error,
    login: context.login,
    register: context.register,
    logout: context.logout,
    setUser: context.setUser,
  };
}; 