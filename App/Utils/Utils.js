import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import NetInfo from "@react-native-community/netinfo";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  limit,
} from "firebase/firestore";
import { app } from "./FirebaseConfig";

// Token Cache
export const tokenCache = {
  async getToken(key) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// Pré-carregar Firebase e testar conexão
export const preloadFirebase = async () => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Firebase connection timeout")), 8000),
  );

  try {
    const db = getFirestore(app);
    await Promise.race([
      getDocs(query(collection(db, "Favorites"), limit(1))),
      timeoutPromise,
    ]);
    return true;
  } catch (e) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      const db = getFirestore(app);
      await Promise.race([
        getDocs(query(collection(db, "Favorites"), limit(1))),
        new Promise((_, reject) => setTimeout(() => reject(), 4000)),
      ]);
      return true;
    } catch (err) {
      return false;
    }
  }
};

// Restaurar conexão
export const handleConnectionRestored = async (
  setIsCheckingConnection,
  setIsConnected,
  setLocation,
  location,
  isInitialized,
) => {
  if (!isInitialized) return;

  setIsCheckingConnection(true);
  const startTime = Date.now();
  const maxTotalTime = 8000;

  try {
    if (!location) {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          let locationData = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
            maximumAge: 30000,
          });
          setLocation(locationData.coords);
        }
      } catch (err) {}
    }

    if (Date.now() - startTime < maxTotalTime) {
      await preloadFirebase();
    }

    if (Date.now() - startTime < maxTotalTime * 0.8) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsConnected(true);
  } catch (error) {
    setIsConnected(true);
  } finally {
    setIsCheckingConnection(false);
  }
};

// Verificar conectividade
export const checkConnectivity = async (
  setIsCheckingConnection,
  setIsConnected,
  setAppIsReady,
  setLocation,
  location,
  isInitialized,
  handleConnectionRestored,
) => {
  setIsCheckingConnection(true);
  try {
    const netInfoState = await NetInfo.fetch();

    if (netInfoState.isConnected) {
      if (!isInitialized) {
        setIsConnected(true);

        if (!location) {
          try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === "granted") {
              let locationData = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Low,
                maximumAge: 60000,
              });
              setLocation(locationData.coords);
            }
          } catch (err) {
            console.warn("Location error:", err);
          }
        }
      } else {
        handleConnectionRestored();
        return;
      }
    } else {
      setIsConnected(false);
    }
  } catch (error) {
    console.warn("Connectivity check failed:", error);
    setIsConnected(false);
  } finally {
    setIsCheckingConnection(false);
    setAppIsReady(true);
  }
};

// Gerencia o fluxo de autenticação OAuth para diferentes provedores (Google, Facebook, Apple).
export const handleAuthFlow = async (
  provider,
  startFlow,
  signOut,
  setLoadingProvider,
) => {
  setLoadingProvider(provider);

  try {
    if (signOut) await signOut();

    const { createdSessionId, setActive } = await startFlow();
    if (createdSessionId) {
      setActive({ session: createdSessionId });
    }
  } catch (err) {
    let errorMessage = "Login failed. Please try again.";

    if (err.message?.includes("single session mode")) {
      errorMessage =
        "There's an issue with your previous session. Please restart the app and try again.";
    } else if (
      err.message?.includes("Network") ||
      err.message?.includes("network")
    ) {
      errorMessage =
        "Network error. Please check your internet connection and try again.";
    } else if (
      err.message?.includes("cancelled") ||
      err.message?.includes("canceled")
    ) {
      setLoadingProvider(null);
      return;
    } else if (err.message?.includes("timeout")) {
      errorMessage =
        "Login request timed out. Please try again when you have a better connection.";
    }

    Alert.alert("Login Error", errorMessage);
  } finally {
    setLoadingProvider(null);
  }
};
