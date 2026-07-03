/**
 * Optimizes a Cloudinary image URL by appending responsive/quality transformations.
 *
 * @param url The raw image URL
 * @param width The target width (defaults to 800)
 * @returns The optimized Cloudinary URL or the original URL if not from Cloudinary
 */
export function optimizeCloudinaryUrl(
  url: string | null | undefined,
  width = 800
): string {
  if (!url) return "";

  // Only transform Cloudinary URLs
  if (
    !url.includes("res.cloudinary.com") ||
    !url.includes("/upload/")
  ) {
    return url;
  }

  // Avoid double transformation
  if (
    url.includes("/f_auto,") ||
    url.includes("/q_auto,") ||
    url.includes("/f_auto/") ||
    url.includes("/q_auto/")
  ) {
    return url;
  }

  // Append optimization parameters
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,w_${width},c_limit/`
  );
}
