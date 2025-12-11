let serverUrl: string | null = null;

export async function getServerUrl(): Promise<string> {
  if (serverUrl != null) return serverUrl;
  const res = await fetch("/api/env");
  const { SERVER_URL } = await res.json();
  serverUrl = SERVER_URL;
  return serverUrl as string;
}

export async function createPhotoUrl(url: string) {
  const serverUrl = await getServerUrl();
  return `${serverUrl}/image/images/${url}`;
}
