const sanitizeFileName = (fileName) =>
  String(fileName || "todays-casting-card.png")
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim();

export const saveCastingCardDownload = async (download) => {
  const fileName = sanitizeFileName(download.fileName);
  const blob = download.blob
    ? new Blob([download.blob], { type: download.mimeType || "image/png" })
    : null;
  const objectUrl = blob ? URL.createObjectURL(blob) : download.url;

  if (!objectUrl) {
    throw new Error("다운로드할 카드 파일이 없습니다.");
  }

  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();

  if (blob) {
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  return { platform: "web" };
};
