export const getAssetPath = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }

  const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH;
  const isProd = process.env.NODE_ENV === "production";
  const defaultBasePath = isProd ? "/Dental_SoftwareUI" : "";
  const basePath = envBasePath !== undefined ? envBasePath : defaultBasePath;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const encodedPath = cleanPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")
    .replace(/%20/g, "%20");

  if (basePath && (cleanPath === basePath || cleanPath.startsWith(`${basePath}/`))) {
    return cleanPath;
  }

  return `${basePath}${encodedPath}`;
};
