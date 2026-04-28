declare const __APP_VERSION__: string

function readString(key: string, fallback: string) {
  const value = (import.meta.env[key] as unknown as string | undefined) ?? ''
  return value.trim() || fallback
}

export const appEnv = {
  appName: readString('VITE_APP_NAME', 'Editorial Enterprise'),
  apiUrl: readString('VITE_API_URL', 'http://localhost:3000'),
  appVersion: __APP_VERSION__,
  mode: import.meta.env.MODE,
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
} as const
