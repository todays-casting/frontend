import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const sanitizeFileName = (fileName) =>
  String(fileName || "todays-casting-card.png")
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim();

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let output = "";
  let index = 0;

  for (; index + 2 < bytes.length; index += 3) {
    output += BASE64_CHARS[bytes[index] >> 2];
    output += BASE64_CHARS[((bytes[index] & 3) << 4) | (bytes[index + 1] >> 4)];
    output += BASE64_CHARS[((bytes[index + 1] & 15) << 2) | (bytes[index + 2] >> 6)];
    output += BASE64_CHARS[bytes[index + 2] & 63];
  }

  if (index < bytes.length) {
    output += BASE64_CHARS[bytes[index] >> 2];

    if (index === bytes.length - 1) {
      output += BASE64_CHARS[(bytes[index] & 3) << 4];
      output += "==";
    } else {
      output += BASE64_CHARS[((bytes[index] & 3) << 4) | (bytes[index + 1] >> 4)];
      output += BASE64_CHARS[(bytes[index + 1] & 15) << 2];
      output += "=";
    }
  }

  return output;
};

export const saveCastingCardDownload = async (download) => {
  const fileName = sanitizeFileName(download.fileName);

  const permission = await MediaLibrary.requestPermissionsAsync(true);

  if (permission.status !== "granted") {
    throw new Error("사진 접근 권한이 필요합니다.");
  }

  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

  if (download.url) {
    await FileSystem.downloadAsync(download.url, fileUri);
  } else if (download.arrayBuffer) {
    await FileSystem.writeAsStringAsync(
      fileUri,
      arrayBufferToBase64(download.arrayBuffer),
      { encoding: FileSystem.EncodingType.Base64 }
    );
  } else {
    throw new Error("다운로드할 카드 파일이 없습니다.");
  }

  await MediaLibrary.saveToLibraryAsync(fileUri);

  return { platform: "native", fileUri };
};
