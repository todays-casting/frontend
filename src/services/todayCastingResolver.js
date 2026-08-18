import calendarApi from "../api/calendar-api";
import castingsApi from "../api/castings-api";
import recordsApi from "../api/records-api";
import { getTodayDateKey } from "./todayRecordState";

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

export const getStatusRecordId = (status) =>
  pickFirst(
    status?.dailyRecordId,
    status?.recordId,
    status?.record?.id,
    status?.dailyRecord?.id,
    status?.id
  );

export const isPlaceholderImageUrl = (value) =>
  typeof value === "string" &&
  /\/default-[^/?#]+\.png(?:[?#].*)?$/i.test(value);

export const hasCompleteCastingImage = (casting) =>
  Boolean(
    casting &&
      typeof casting.imageUrl === "string" &&
      casting.imageUrl.trim().length > 0 &&
      !isPlaceholderImageUrl(casting.imageUrl) &&
      (casting.hasGeneratedImageUrl || casting.imageKey)
  );

const toYearMonth = (dateKey) => dateKey.slice(0, 7);

const resolveCastingForRecord = async (recordId, recordDate) => {
  if (!recordId) {
    return null;
  }

  const casting = await castingsApi.getCastingByRecordId(recordId);

  return {
    casting,
    isComplete: hasCompleteCastingImage(casting),
    recordId,
    recordDate,
  };
};

const resolveLatestCompleteCastingFromMarkers = async (dateKey) => {
  const markers = await calendarApi.getMonthlyMarkers(toYearMonth(dateKey));
  const candidateDates = [...new Set(
    markers
      .filter((marker) => marker?.hasRecord && marker.recordDate <= dateKey)
      .map((marker) => marker.recordDate)
  )].sort((a, b) => b.localeCompare(a));

  for (const recordDate of candidateDates) {
    try {
      const record = await recordsApi.getRecordByDate(recordDate);

      if (!record?.id || record.status !== "COMPLETED") {
        continue;
      }

      const resolved = await resolveCastingForRecord(record.id, recordDate);

      if (resolved?.isComplete) {
        return resolved;
      }
    } catch {
      // Keep searching older marked dates.
    }
  }

  return null;
};

export const resolveTodayCastingTarget = async () => {
  const todayKey = getTodayDateKey();
  const status = await recordsApi.getTodayStatus();
  const recordId = getStatusRecordId(status);

  if (status?.screen === "RESULT" && recordId) {
    try {
      const resolved = await resolveCastingForRecord(recordId, todayKey);

      if (resolved?.isComplete) {
        return {
          ...resolved,
          status,
          screen: "RESULT",
        };
      }

      return {
        ...resolved,
        status,
        screen: "WAITING",
      };
    } catch {
      return {
        status,
        recordId,
        recordDate: todayKey,
        screen: "WAITING",
      };
    }
  }

  const fallback = await resolveLatestCompleteCastingFromMarkers(todayKey);

  if (fallback) {
    return {
      ...fallback,
      status,
      screen: "RESULT",
    };
  }

  return {
    status,
    recordId,
    recordDate: todayKey,
    screen: status?.screen,
  };
};
