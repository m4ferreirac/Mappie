import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { useState, useEffect, useCallback } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import LoginScreen from "./App/Screen/LoginScreen/LoginScreen";
import * as SecureStore from "expo-secure-store";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigation from "./App/Navigations/TabNavigation";
import * as Location from "expo-location";
import "react-native-get-random-values";
import { UserLocationContext } from "./App/Context/UserLocationContext";
import NetInfo from "@react-native-community/netinfo";
import NoConnectionScreen from "./App/Screen/NoConnectionScreen/NoConnectionScreen";
import { app } from "./App/Utils/FirebaseConfig";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  limit,
} from "firebase/firestore";

SplashScreen.preventAutoHideAsync();
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const tokenCache = {
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

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isConnected, setIsConnected] = useState(null);
  const [appIsReady, setAppIsReady] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [loaded, error] = useFonts({
    "Outfit-Bold": require("./assets/fonts/Outfit-Bold.ttf"),
    "Outfit-SemiBold": require("./assets/fonts/Outfit-SemiBold.ttf"),
    "Outfit-Regular": require("./assets/fonts/Outfit-Regular.ttf"),
  });

  const preloadFirebase = async () => {
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

  const handleConnectionRestored = async () => {
    if (!isInitialized) return;

    setIsCheckingConnection(true);

    const startTime = Date.now();
    const maxTotalTime = 8000;

    try {
      if (!location) {
        const locationPromise = async () => {
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
        };

        const locationTimeout = new Promise((resolve) =>
          setTimeout(resolve, 2000),
        );
        await Promise.race([locationPromise(), locationTimeout]);
      }

      const timeElapsed = Date.now() - startTime;
      if (timeElapsed < maxTotalTime) {
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

  const checkConnectivity = useCallback(async () => {
    setIsCheckingConnection(true);
    try {
      const netInfoState = await NetInfo.fetch();

      if (netInfoState.isConnected) {
        if (!isInitialized) {
          setIsConnected(true);

          if (!location) {
            try {
              let { status } =
                await Location.requestForegroundPermissionsAsync();
              if (status !== "granted") {
                setErrorMsg("Permission to access location was denied");
              } else {
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
  }, [location, isInitialized]);

  useEffect(() => {
    async function prepareApp() {
      await checkConnectivity();
    }

    prepareApp();

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        if (!isConnected) {
          checkConnectivity();
        }
      } else {
        setIsConnected(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [checkConnectivity, isConnected]);

  useEffect(() => {
    if ((loaded || error) && appIsReady) {
      SplashScreen.hideAsync().then(() => {
        setIsInitialized(true);
      });
    }
  }, [loaded, error, appIsReady]);

  const handleRetry = useCallback(() => {
    checkConnectivity();
  }, [checkConnectivity]);

  if (!loaded || !appIsReady) {
    return null;
  }

  if (isConnected === false) {
    return (
      <View style={styles.container}>
        <NoConnectionScreen
          onRetry={handleRetry}
          isRetrying={isCheckingConnection}
        />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <UserLocationContext.Provider value={{ location, setLocation }}>
        <View style={styles.container}>
          <SignedIn>
            <NavigationContainer>
              <TabNavigation />
            </NavigationContainer>
          </SignedIn>
          <SignedOut>
            <LoginScreen />
          </SignedOut>
          <StatusBar style="auto" />
        </View>
      </UserLocationContext.Provider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 0,
  },
});
