import client from "./client";

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const unwrapResponse = (data) => data?.result ?? data?.data ?? data;

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

const castingsApi = {
  createCasting,
  getCastingByRecordId,
  getCastingImageUrl,
  toggleFavorite,
};

export default castingsApi;
