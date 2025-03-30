import axios from "axios";
import NetInfo from "@react-native-community/netinfo";

const GOOGLE_API = process.env.EXPO_PUBLIC_GOOGLE_API;
const BASE_URL = "https://places.googleapis.com/v1/places:searchNearby";

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": GOOGLE_API,
    "X-Goog-FieldMask": [
      "places.displayName",
      "places.formattedAddress",
      "places.shortFormattedAddress",
      "places.location",
      "places.evChargeOptions",
      "places.photos",
      "places.id",
    ],
  },
});

const checkConnectivityBeforeRequest = async () => {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    throw new Error("No internet connection available");
  }
  return true;
};

const NewNearByPlace = async (data, retryCount = 2) => {
  try {
    await checkConnectivityBeforeRequest();

    await new Promise((resolve) => setTimeout(resolve, 300));

    return await axiosInstance.post(BASE_URL, data);
  } catch (error) {
    if (retryCount > 0) {
      if (
        axios.isAxiosError(error) &&
        (error.message.includes("Network Error") ||
          error.code === "ECONNABORTED" ||
          !error.response)
      ) {
        const delay = 1000 * Math.pow(2, 2 - retryCount);
        await new Promise((resolve) => setTimeout(resolve, delay));

        return NewNearByPlace(data, retryCount - 1);
      }
    }

    throw error;
  }
};

const safeFetchNearByPlace = async (data) => {
  try {
    return await NewNearByPlace(data);
  } catch (error) {
    console.warn("Failed to fetch places after retries:", error.message);
    return {
      data: {
        places: [],
      },
    };
  }
};

export default {
  NewNearByPlace,
  safeFetchNearByPlace,
};
