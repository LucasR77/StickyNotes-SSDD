const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ErrorBody = {
  message?: string;
};

export async function request<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...init,
    credentials: "include", // <-- Crucial: envía y recibe cookies de sesión entre localhost:3000 y 3001
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const data = (await response.json()) as TResponse & ErrorBody;
  if (!response.ok) {
    throw new Error(data.message || "No se pudo completar la operación");
  }
  return data;
}
