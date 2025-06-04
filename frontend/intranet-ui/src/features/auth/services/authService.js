const API_URL = '/api/auth'; // Базовый URL для аутентификации, позже будет из .env

/**
 * Calls the login API endpoint.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} The response from the API (user data and token)
 * @throws {Error} If the API call fails
 */
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Login failed and could not parse error response' }));
    throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json(); // Ожидаем { user: {...}, token: "..." }
};

/**
 * Calls the register API endpoint.
 * @param {string} fullName
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} The response from the API (user data and token)
 * @throws {Error} If the API call fails
 */
export const register = async (fullName, email, password) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ full_name: fullName, email, password }), // Backend может ожидать full_name
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Registration failed and could not parse error response' }));
    throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json(); // Ожидаем { user: {...}, token: "..." }
};

/**
 * Placeholder for fetching current user data if a token is present.
 * This might be used to verify a token on app load.
 * @param {string} token
 * @returns {Promise<Object>} User data
 * @throws {Error} If the API call fails
 */
export const getCurrentUser = async (token) => {
  const response = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch current user' }));
    throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json(); // Ожидаем { id, email, full_name, role, ... }
};

// Можно добавить функцию logout, если на бэкенде есть эндпоинт для инвалидации токена.
// export const logout = async (token) => { ... }

// В будущем можно будет добавить и другие функции, например, для сброса пароля. 