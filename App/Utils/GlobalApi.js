import axios from "axios";
import NetInfo from "@react-native-community/netinfo";

const GOOGLE_API = process.env.EXPO_PUBLIC_GOOGLE_API;
const BASE_URL = "https://places.googleapis.com/v1/places:searchNearby";

// Configuração do Axios com timeout e headers para a API do Google Places
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

// Verifica a conectividade antes de realizar a requisição
const checkConnectivityBeforeRequest = async () => {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    throw new Error("No internet connection available");
  }
  return true;
};

// Faz uma requisição para buscar lugares próximos, com tentativa de reconexão
const NewNearByPlace = async (data, retryCount = 2) => {
  try {
    await checkConnectivityBeforeRequest();

    // Pequeno atraso antes da requisição para evitar sobrecarga
    await new Promise((resolve) => setTimeout(resolve, 300));

    return await axiosInstance.post(BASE_URL, data);
  } catch (error) {
    // Se a requisição falhar por problemas de conexão, tenta novamente
    if (retryCount > 0) {
      if (
        axios.isAxiosError(error) &&
        (error.message.includes("Network Error") ||
          error.code === "ECONNABORTED" ||
          !error.response)
      ) {
        // Implementação de um backoff exponencial para retries
        const delay = 1000 * Math.pow(2, 2 - retryCount);
        await new Promise((resolve) => setTimeout(resolve, delay));

        return NewNearByPlace(data, retryCount - 1);
      }
    }

    throw error;
  }
};

// Função segura para buscar lugares próximos, garantindo tratamento de erro
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
