import { fetchWithAuth } from '../../../core/utils/authUtils'; // Исправленный путь к общей функции

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Получает список всех сотрудников (пользователей).
 * @param {string} token - JWT токен для аутентификации.
 * @param {number} skip - Количество пропускаемых записей (для пагинации).
 * @param {number} limit - Максимальное количество возвращаемых записей.
 * @returns {Promise<Array>} Промис с массивом сотрудников.
 */
export const getAllEmployees = async (token, skip = 0, limit = 100) => {
  return fetchWithAuth(`${API_BASE_URL}/api/users/?skip=${skip}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Authorization заголовок будет добавлен функцией fetchWithAuth
    },
  }, token);
};

/**
 * Обновляет профиль текущего пользователя (телефон, URL аватара).
 * @param {string} token - JWT токен для аутентификации.
 * @param {object} data - Объект с обновляемыми полями { phone_number?: string, photo_url?: string }.
 * @returns {Promise<object>} Промис с обновленным объектом пользователя.
 */
export const updateMyProfile = async (token, data) => {
  return fetchWithAuth(`${API_BASE_URL}/api/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }, token);
};

/**
 * Обновляет данные пользователя администратором.
 * @param {string} token - JWT токен для аутентификации.
 * @param {number} userId - ID пользователя, которого нужно обновить.
 * @param {object} data - Объект с обновляемыми полями (соответствует UserUpdate).
 * @returns {Promise<object>} Промис с обновленным объектом пользователя.
 */
export const adminUpdateUser = async (token, userId, data) => {
  return fetchWithAuth(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }, token);
};

/**
 * Загружает файл аватара на сервер.
 * @param {string} token - JWT токен для аутентификации.
 * @param {File} file - Файл аватара для загрузки.
 * @returns {Promise<object>} Промис с объектом, содержащим URL загруженного аватара (например, { photo_url: "/path/to/image.jpg" }).
 */
export const uploadAvatarFile = async (token, file) => {
  const formData = new FormData();
  // Ключ 'avatarFile' должен совпадать с тем, что будет ожидать бэкенд при приеме файла.
  formData.append('avatarfile', file); // Используем lowercase 'avatarfile' как принято для FastAPI UploadFile

  // Предполагаемый URL эндпоинта для загрузки аватара.
  // Мы создадим этот эндпоинт на бэкенде позже.
  const uploadUrl = `${API_BASE_URL}/api/uploads/avatar`;

  return fetchWithAuth(uploadUrl, {
    method: 'POST',
    // При использовании FormData с файлами, заголовок 'Content-Type' устанавливается браузером автоматически
    // и будет содержать multipart/form-data с правильным boundary.
    // Не нужно устанавливать его вручную здесь.
    body: formData,
  }, token);
};

// В будущем можно добавить другие функции:
// export const getEmployeeById = async (token, userId) => { ... };
// export const updateEmployee = async (token, userId, employeeData) => { ... };
// и т.д. 