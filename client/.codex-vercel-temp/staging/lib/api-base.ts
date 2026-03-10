const LOCAL_API_URL = "http://localhost:5000";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return LOCAL_API_URL;
    }

    return trimTrailingSlash(origin);
  }

  return LOCAL_API_URL;
}
