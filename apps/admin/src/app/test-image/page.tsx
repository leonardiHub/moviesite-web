"use client";

import { getImageUrl } from "../utils/imageUtils";

export default function TestImagePage() {
  // Example S3 keys that your backend returns
  const s3Keys = [
    "posters/1756467428561-bj12r1.png",
    "posters/1756467428562-abc123.png",
    "posters/1756467428563-def456.png",
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Image URL Transformation Test</h1>

      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">How It Works:</h2>
          <p className="text-sm text-gray-700">
            The backend returns S3 keys like "posters/1756467428561-bj12r1.png".
            Our utility function transforms these into displayable URLs using
            the image proxy endpoint.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {s3Keys.map((s3Key, index) => {
            const displayUrl = getImageUrl(s3Key);
            return (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Test Image {index + 1}</h3>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">S3 Key:</span>
                    <div className="bg-gray-100 p-2 rounded text-xs break-all">
                      {s3Key}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">Transformed URL:</span>
                    <div className="bg-blue-100 p-2 rounded text-xs break-all">
                      {displayUrl}
                    </div>
                  </div>
                </div>

                {/* Display the actual image */}
                <div className="mt-4">
                  <img
                    src={displayUrl || ""}
                    alt={`Test poster ${index + 1}`}
                    className="w-full h-48 object-cover rounded border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                  <div className="hidden w-full h-48 bg-gray-200 rounded border flex items-center justify-center text-gray-500 text-sm">
                    Image not found or loading...
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">✅ What This Means:</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              • Your backend returns S3 keys (e.g.,
              "posters/1756467428561-bj12r1.png")
            </li>
            <li>
              • Our utility transforms them to:
              `${process.env.NEXT_PUBLIC_API_BASE || 'http://51.79.254.237:4000'}/v1/images/poster/posters%2F1756467428561-bj12r1.png`
            </li>
            <li>• The image proxy generates S3 presigned URLs and redirects</li>
            <li>• Images display perfectly without needing CloudFront CDN!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
