import { getServerUrl } from "@net/serverInfo";
import { LocalStorageUtil } from "./localStorageUtil";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>; // query params
}

export async function fetchWithServerUrl(input: string, init?: FetchOptions) {
  const baseUrl = await getServerUrl();

  // Xử lý params thành query string
  let url = input.startsWith("/") ? input : `/${input}`;
  if (init?.params) {
    const queryString = new URLSearchParams(
      Object.entries(init.params).map(([k, v]) => [k, String(v)])
    ).toString();
    url += (url.includes("?") ? "&" : "?") + queryString;
  }

  // Normalize base URL
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const fullUrl = normalizedBase + url;

  // Bỏ params ra khỏi init trước khi gọi fetch
  const { params, ...restInit } = init || {};

  // await new Promise((resolve) => setTimeout(resolve, 2000));

  return fetch(fullUrl, restInit);
}

export async function fetchWithAuth(input: string, init?: FetchOptions) {
  const token = LocalStorageUtil.getToken();
  const headers: HeadersInit = {
    'ngrok-skip-browser-warning': 'true',
    ...(init?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "X-TOKEN": `${token}`
  };
  return fetchWithServerUrl(input, { ...init, headers });
}
