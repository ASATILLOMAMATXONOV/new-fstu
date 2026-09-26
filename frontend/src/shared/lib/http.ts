const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(
  path: string,
  params?: RequestOptions['params'],
) {
  const url = new URL(
    path.startsWith('http')
      ? path
      : `${API_URL}${path}`,
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, headers, ...rest } = options;

  const response = await fetch(buildUrl(path, params), {
    ...rest,

    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;

    try {
      const errorData = await response.json();

      message =
        errorData.message ??
        errorData.error ??
        message;
    } catch {
      // JSON bo'lmasa, default message qoladi
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const http = {
  get<T>(
    path: string,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) {
    return request<T>(path, {
      ...options,
      method: 'GET',
    });
  },

  post<T, B = unknown>(
    path: string,
    body?: B,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) {
    return request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T, B = unknown>(
    path: string,
    body?: B,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) {
    return request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T, B = unknown>(
    path: string,
    body?: B,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) {
    return request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(
    path: string,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) {
    return request<T>(path, {
      ...options,
      method: 'DELETE',
    });
  },
};