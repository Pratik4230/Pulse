export const APP_HOME_PATH = "/pulse"

export function getSafeRedirectPath(path: string | null | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return APP_HOME_PATH
  }
  return path
}
