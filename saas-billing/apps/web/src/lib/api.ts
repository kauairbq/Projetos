import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:4010/api";
const orgId = import.meta.env.VITE_ORG_ID ?? "saas-demo";
const demoEmail = import.meta.env.VITE_DEMO_EMAIL ?? "admin@saas.local";
const demoPassword = import.meta.env.VITE_DEMO_PASSWORD ?? "03101812@";

const authClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

let authPromise: Promise<string | null> | null = null;

async function ensureToken(): Promise<string | null> {
  const cached = localStorage.getItem("saas_token");
  if (cached) return cached;

  if (!authPromise) {
    authPromise = authClient
      .post("/auth/login", { email: demoEmail, password: demoPassword })
      .then((res) => {
        const token = res.data?.accessToken ?? res.data?.token ?? null;
        if (token) localStorage.setItem("saas_token", token);
        return token;
      })
      .catch(() => null)
      .finally(() => {
        authPromise = null;
      });
  }

  return authPromise;
}

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await ensureToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  config.headers = {
    ...config.headers,
    "x-organization-id": orgId,
  };

  return config;
});
