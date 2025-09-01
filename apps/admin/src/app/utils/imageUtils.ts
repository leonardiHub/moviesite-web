/**
 * Utility functions for handling image URLs in the admin frontend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://51.79.254.237:4000";

/**
 * Converts an S3 key (e.g., "posters/1756467428561-bj12r1.png")
 * to a displayable URL using the image proxy endpoint
 */
export const getImageUrl = (
  s3Key: string | null | undefined
): string | null => {
  if (!s3Key) return null;

  // If it's already a full URL, return as is
  if (s3Key.startsWith("http://") || s3Key.startsWith("https://")) {
    return s3Key;
  }

  // Transform S3 key to image proxy URL
  return `${API_BASE}/v1/images/${encodeURIComponent(s3Key)}`;
};

/**
 * Converts an S3 key to a displayable URL for any artwork type
 */
export const getArtworkUrl = (
  s3Key: string | null | undefined,
  kind: string = "poster"
): string | null => {
  if (!s3Key) return null;

  // If it's already a full URL, return as is
  if (s3Key.startsWith("http://") || s3Key.startsWith("https://")) {
    return s3Key;
  }

  // Transform S3 key to image proxy URL
  return `${API_BASE}/v1/images/artwork/${kind}/${encodeURIComponent(s3Key)}`;
};

/**
 * Gets poster URL specifically
 * Handles S3 keys like "posters/1756467428561-bj12r1.png"
 */
export const getPosterUrl = (
  s3Key: string | null | undefined
): string | null => {
  if (!s3Key) return null;

  // If it's already a full URL, return as is
  if (s3Key.startsWith("http://") || s3Key.startsWith("https://")) {
    return s3Key;
  }

  // If the S3 key contains a path (e.g., "posters/filename.png"),
  // use the general image endpoint to avoid path encoding issues
  if (s3Key.includes("/")) {
    return `${API_BASE}/v1/images/${encodeURIComponent(s3Key)}`;
  }

  // For simple filenames, use the poster endpoint
  return `${API_BASE}/v1/images/poster/${encodeURIComponent(s3Key)}`;
};

/**
 * Checks if a URL is an S3 key (doesn't start with http)
 */
export const isS3Key = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return !url.startsWith("http://") && !url.startsWith("https://");
};
