// Вспомогательная функция для выполнения запросов fetch с автоматическим добавлением токена
// и обработкой Content-Type для FormData
export const fetchWithAuth = async (url, options = {}, token) => {
  const headers = {
    ...options.headers,
  };

  // Only set Content-Type if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: `HTTP error! status: ${response.status}` };
    }
    throw new Error(errorData.detail || errorData.message || `Request failed with status ${response.status}`);
  }
  // Для DELETE запросов, которые могут не возвращать тело
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return null; 
  }

  return response.json();
}; 