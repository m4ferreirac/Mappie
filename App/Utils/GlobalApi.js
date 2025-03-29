import axios from "axios";

const GOOGLE_API = process.env.EXPO_PUBLIC_GOOGLE_API;
const BASE_URL = "https://places.googleapis.com/v1/places:searchNearby";

const config = {
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
};

const NewNearByPlace = (data) => axios.post(BASE_URL, data, config);

export default { NewNearByPlace };
