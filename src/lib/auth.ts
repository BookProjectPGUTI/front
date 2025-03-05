import { user } from './stores'; 

let refreshTimer: number | null = null; 

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); 
    const exp = payload.exp;
    return Date.now() >= exp * 1000; 
  } catch (err) {
    console.error("Ошибка при проверке токена:", err);
    return true; 
  }
};

export const getTokenExpiration = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); 
    return payload.exp * 1000; 
  } catch (err) {
    console.error("Ошибка при декодировании токена:", err);
    return null;
  }
};

export const refreshTokens = async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
  try {
    const response = await fetch("http://localhost:8000/api/v1/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      const exp = getTokenExpiration(data.accessToken); 
      if (exp) {
        scheduleTokenRefresh(exp); 
      }
      return data;
    } else {
      throw new Error("Ошибка при обновлении токенов");
    }
  } catch (err) {
    console.error("Ошибка при обновлении токенов:", err);
    return null;
  }
};

export const fetchWithRefresh = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let response = await fetch(url, {
    ...options,
    credentials: "include", 
  });

  if (response.status === 401) {
    const newTokens = await refreshTokens();

    if (newTokens) {
      response = await fetch(url, {
        ...options,
        credentials: "include",
      });
    } else {
      window.location.href = "/login";
    }
  }

  return response;
};

export const scheduleTokenRefresh = (exp: number) => {
  if (refreshTimer) {
    clearTimeout(refreshTimer); 
  }

  const now = Date.now();
  const delay = exp - now - 5 * 60 * 1000; 

  if (delay > 0) {
    refreshTimer = setTimeout(async () => {
      const newTokens = await refreshTokens(); 
      if (newTokens) {
        const newExp = getTokenExpiration(newTokens.accessToken); 
        if (newExp) {
          scheduleTokenRefresh(newExp); 
        }
      }
    }, delay);
  }
};

// Очистка таймера
export const clearRefreshTimer = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer); // Очищаем таймер
    refreshTimer = null;
  }
};