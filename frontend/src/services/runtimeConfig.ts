const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getBrowserOrigin = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const { origin } = window.location;
  if (!origin) {
    return "";
  }

  return trimTrailingSlash(origin);
};

const resolveApiBaseUrl = () => {
  const envApiUrl = import.meta.env.VITE_API_URL?.trim();
  if (envApiUrl) {
    return trimTrailingSlash(envApiUrl);
  }

  if (import.meta.env.DEV) {
    return "http://localhost:5000";
  }

  const browserOrigin = getBrowserOrigin();
  if (browserOrigin) {
    return browserOrigin;
  }

  return "http://localhost:5000";
};

export const API_BASE_URL = resolveApiBaseUrl();
