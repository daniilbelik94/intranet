import { fetchWithAuth } from '../../../core/utils/authUtils'; // Импортируем общую функцию

const NEWS_API_URL = '/api/news'; // Базовый URL для API новостей
const CATEGORIES_API_URL = '/api/categories/'; // Добавлено - добавлен слеш в конце

/**
 * Fetches a list of news items.
 * @param {string} token - Authentication token.
 * @param {number} skip - Number of items to skip (for pagination).
 * @param {number} limit - Maximum number of items to return.
 * @returns {Promise<Object>} The response from the API (e.g., { items: [], total: 0 })
 */
export const getAllNews = async (token, skip = 0, limit = 10) => {
  // Для получения списка новостей токен может быть не обязателен, если эндпоинт публичный
  // Но если он защищен, токен нужен. Сейчас эндпоинт GET /api/news публичный.
  return fetchWithAuth(`${NEWS_API_URL}/?skip=${skip}&limit=${limit}`, { method: 'GET' }, token); // Токен может быть нужен, если эндпоинт не публичный
};

/**
 * Fetches news items created by the current authenticated user.
 * @param {string} token - Authentication token.
 * @param {number} skip - Number of items to skip.
 * @param {number} limit - Maximum number of items to return.
 * @returns {Promise<Object>} The response from the API (e.g., { items: [], total: 0 })
 */
export const getMyNews = async (token, skip = 0, limit = 10) => {
  if (!token) throw new Error('Authentication token is required to fetch user news.');
  return fetchWithAuth(`${NEWS_API_URL}/my?skip=${skip}&limit=${limit}`, { method: 'GET' }, token);
};

/**
 * Fetches a single news item by its ID.
 * @param {string} [token] - Optional authentication token (if endpoint requires it, though GET by ID is often public).
 * @param {number} itemId - The ID of the news item.
 * @returns {Promise<Object>} The news item data.
 */
export const getNewsItemById = async (itemId, token) => {
    // GET /api/news/{item_id} также публичный
  return fetchWithAuth(`${NEWS_API_URL}/${itemId}`, { method: 'GET' }, token); 
};

/**
 * Creates a new news item.
 * @param {string} token - Authentication token.
 * @param {Object} newsData - The data for the new news item (e.g., { title, content, imageFile (optional) }).
 * @returns {Promise<Object>} The created news item data.
 */
export const createNewsItem = async (token, newsData) => {
  if (!token) throw new Error('Authentication token is required to create a news item.');

  const formData = new FormData();
  formData.append('title', newsData.title);
  formData.append('content', newsData.content);

  if (newsData.slug) formData.append('slug', newsData.slug);
  if (newsData.short_description) formData.append('short_description', newsData.short_description);
  if (newsData.status) formData.append('status', newsData.status);

  if (newsData.category_ids && Array.isArray(newsData.category_ids)) {
    newsData.category_ids.forEach(id => formData.append('category_ids', id.toString()));
  }

  if (newsData.coverImageFile) {
    formData.append('cover_image', newsData.coverImageFile);
  }
  
  return fetchWithAuth(`${NEWS_API_URL}/`, {
    method: 'POST',
    body: formData,
  }, token);
};

/**
 * Updates an existing news item.
 * @param {string} token - Authentication token.
 * @param {number} itemId - The ID of the news item to update.
 * @param {Object} newsData - The new data for the news item (e.g., { title, content, imageFile (optional) }).
 * @returns {Promise<Object>} The updated news item data.
 */
export const updateNewsItem = async (token, itemId, newsData) => {
  if (!token) throw new Error('Authentication token is required to update a news item.');

  const formData = new FormData();
  if (newsData.title !== undefined) formData.append('title', newsData.title);
  if (newsData.content !== undefined) formData.append('content', newsData.content);
  if (newsData.slug !== undefined) formData.append('slug', newsData.slug);
  if (newsData.short_description !== undefined) formData.append('short_description', newsData.short_description);
  if (newsData.status !== undefined) formData.append('status', newsData.status);

  if (newsData.category_ids && Array.isArray(newsData.category_ids)) {
    newsData.category_ids.forEach(id => formData.append('category_ids', id.toString()));
  } else if (newsData.category_ids === null || (Array.isArray(newsData.category_ids) && newsData.category_ids.length === 0)) {
    // Если передан пустой массив или null для category_ids, отправляем пустой параметр, 
    // чтобы сервер мог это интерпретировать как "очистить категории"
    // Сервер должен быть готов принять пустой параметр category_ids
    formData.append('category_ids', ''); 
  }

  if (newsData.coverImageFile) {
    formData.append('cover_image', newsData.coverImageFile);
  } else if (newsData.removeCoverImage === true) {
    formData.append('remove_cover_image', 'true');
  }

  return fetchWithAuth(`${NEWS_API_URL}/${itemId}`, {
    method: 'PUT',
    body: formData,
  }, token);
};

/**
 * Deletes a news item.
 * @param {string} token - Authentication token.
 * @param {number} itemId - The ID of the news item to delete.
 * @returns {Promise<Object | null>} The deleted news item data or null if no content.
 */
export const deleteNewsItem = async (token, itemId) => {
  if (!token) throw new Error('Authentication token is required to delete a news item.');
  return fetchWithAuth(`${NEWS_API_URL}/${itemId}`, { method: 'DELETE' }, token);
};

// --- Category Functions ---

export const getAllCategories = async (token) => {
  return fetchWithAuth(CATEGORIES_API_URL, { method: 'GET' }, token);
};

export const getCategoryById = async (categoryId, token) => {
  return fetchWithAuth(`${CATEGORIES_API_URL}/${categoryId}`, { method: 'GET' }, token);
};

export const createCategory = async (token, categoryData) => {
  if (!token) throw new Error('Authentication token is required to create a category.');
  return fetchWithAuth(CATEGORIES_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData),
  }, token);
};

export const updateCategory = async (token, categoryId, categoryData) => {
  if (!token) throw new Error('Authentication token is required to update a category.');
  return fetchWithAuth(`${CATEGORIES_API_URL}/${categoryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData),
  }, token);
};

export const deleteCategory = async (token, categoryId) => {
  if (!token) throw new Error('Authentication token is required to delete a category.');
  return fetchWithAuth(`${CATEGORIES_API_URL}/${categoryId}`, { method: 'DELETE' }, token);
}; 