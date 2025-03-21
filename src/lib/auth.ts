import { userStore } from './stores'; 

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
    if (!token || typeof token !== "string") {
      console.error("Токен отсутствует или имеет неверный формат:", token);
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error("Токен имеет неверный формат (ожидается 3 части):", token);
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    if (!payload || !payload.exp) {
      console.error("Payload токена не содержит expiration time (exp):", payload);
      return null;
    }

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

  if (response.status === 401 && !url.includes("/auth/sign-in")) {
    const newTokens = await refreshTokens();

    if (newTokens) {
      response = await fetch(url, {
        ...options,
        credentials: "include",
      });
    } else {
      window.location.href = "/";
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
  } else {
    console.warn("Токен уже истек или истечет менее чем через 5 минут.");
    refreshTokens();
  }
};

export const clearRefreshTimer = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer); 
    refreshTimer = null;
  }
};

