import { Platform } from "react-native";
import client from "./client";

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const unwrapResponse = (data) => data?.result ?? data?.data ?? data;

const DOWNLOAD_ENDPOINT = (recordId) => `/castings/${recordId}/download-card`;

const getHeader = (headers, name) =>
  headers?.[name] ?? headers?.[name.toLowerCase()] ?? headers?.[name.toUpperCase()];

const getFileNameFromDisposition = (contentDisposition) => {
  if (!contentDisposition) {
    return "";
  }

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].trim().replace(/^"|"$/g, ""));
  }

  const fileNameMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);
  return fileNameMatch?.[1]?.trim() ?? "";
};

const arrayBufferToText = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let text = "";

  for (let index = 0; index < bytes.length; index += 8192) {
    text += String.fromCharCode(...bytes.subarray(index, index + 8192));
  }

  return text;
};

const extractDownloadUrl = (data) =>
  pickFirst(
    data?.downloadUrl,
    data?.downloadURL,
    data?.fileUrl,
    data?.fileURL,
    data?.imageUrl,
    data?.imageURL,
    data?.url,
    data?.presignedUrl,
    data?.presignedURL,
    typeof data === "string" ? data : ""
  );

const normalizeDownloadResponse = async (response, fallbackFileName) => {
  const contentType = getHeader(response.headers, "content-type") ?? "";
  const contentDisposition = getHeader(response.headers, "content-disposition");
  const fileName =
    getFileNameFromDisposition(contentDisposition) || fallbackFileName;
  const mimeType = contentType.split(";")[0] || "image/png";
  const isJson = contentType.includes("application/json");

  if (isJson) {
    const jsonText =
      Platform.OS === "web" && response.data?.text
        ? await response.data.text()
        : arrayBufferToText(response.data);
    const data = unwrapResponse(JSON.parse(jsonText));

    return {
      fileName,
      mimeType,
      url: extractDownloadUrl(data),
    };
  }

  return {
    fileName,
    mimeType,
    blob: Platform.OS === "web" ? response.data : null,
    arrayBuffer: Platform.OS === "web" ? null : response.data,
  };
};

const isPlaceholderImageUrl = (value) =>
  typeof value === "string" &&
  /\/default-[^/?#]+\.png(?:[?#].*)?$/i.test(value);

const asImageKey = (value) => (typeof value === "string" ? value : null);

const extractCastingSource = (casting) =>
  casting?.casting ??
  casting?.castingCard ??
  casting?.castingResult ??
  casting?.result ??
  casting ??
  {};

const getCastingImageUrl = async (imageKey) => {
  const response = await client.get("/castings/image-url", {
    params: { key: imageKey },
  });
  const data = unwrapResponse(response.data);

  return pickFirst(
    data?.imageUrl,
    data?.url,
    data?.presignedUrl,
    data?.presignedURL,
    data?.data?.imageUrl,
    data?.data?.url,
    data?.data?.presignedUrl,
    data?.data?.presignedURL,
    typeof data === "string" ? data : ""
  );
};

const withResolvedCastingImage = async (casting) => {
  const source = extractCastingSource(casting);
  const mergedCasting =
    source && typeof source === "object" && source !== casting
      ? { ...casting, ...source }
      : casting;
  const imageKey = pickFirst(
    source.imageKey,
    source.image_key,
    source.generatedImageKey,
    source.generated_image_key,
    source.generatedImageId,
    source.generated_image_id,
    asImageKey(source.castingImageId),
    casting?.imageKey,
    casting?.image_key,
    casting?.generatedImageKey,
    casting?.generated_image_key,
    casting?.generatedImageId,
    casting?.generated_image_id,
    asImageKey(casting?.castingImageId)
  );
  const hasResolvedImage =
    typeof mergedCasting?.imageUrl === "string" &&
    mergedCasting.imageUrl.trim().length > 0 &&
    !isPlaceholderImageUrl(mergedCasting.imageUrl);

  if (!imageKey) {
    return {
      ...mergedCasting,
      hasGeneratedImageUrl: false,
      hasResolvedCastingImage: hasResolvedImage,
    };
  }

  try {
    const imageUrl = await getCastingImageUrl(imageKey);

    if (!imageUrl) {
      return {
        ...mergedCasting,
        imageKey,
        hasGeneratedImageUrl: false,
        hasResolvedCastingImage: hasResolvedImage,
      };
    }

    return {
      ...mergedCasting,
      imageKey,
      imageUrl,
      hasGeneratedImageUrl: true,
      hasResolvedCastingImage: true,
    };
  } catch (error) {
    console.warn("Failed to resolve casting image URL:", error);
    return {
      ...mergedCasting,
      imageKey,
      hasGeneratedImageUrl: false,
      hasResolvedCastingImage: hasResolvedImage,
    };
  }
};

const createCasting = async (recordId) => {
  const response = await client.post("/castings", {
    recordId,
    dailyRecordId: recordId,
  });
  return withResolvedCastingImage(unwrapResponse(response.data));
};

const getCastingByRecordId = async (recordId) => {
  const response = await client.get(`/castings/${recordId}`);
  return withResolvedCastingImage(unwrapResponse(response.data));
};

const toggleFavorite = async (recordId) => {
  const response = await client.patch(`/castings/${recordId}/favorite`);
  return withResolvedCastingImage(unwrapResponse(response.data));
};

const getCastingCardDownload = async (recordId) => {
  const fallbackFileName = `todays-casting-${recordId}.png`;
  const response = await client.get(DOWNLOAD_ENDPOINT(recordId), {
    responseType: Platform.OS === "web" ? "blob" : "arraybuffer",
  });

  return normalizeDownloadResponse(response, fallbackFileName);
};

const castingsApi = {
  createCasting,
  getCastingByRecordId,
  getCastingCardDownload,
  getCastingImageUrl,
  toggleFavorite,
};

export default castingsApi;
