import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { useState, useEffect, useCallback } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import LoginScreen from "./App/Screen/LoginScreen/LoginScreen";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigation from "./App/Navigations/TabNavigation";
import "react-native-get-random-values";
import { UserLocationContext } from "./App/Context/UserLocationContext";
import NetInfo from "@react-native-community/netinfo";
import NoConnectionScreen from "./App/Screen/NoConnectionScreen/NoConnectionScreen";
import {
  tokenCache,
  handleConnectionRestored,
  checkConnectivity,
} from "./App/Utils/Utils";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Evita que a splash screen desapareça antes da inicialização
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [location, setLocation] = useState(null);
  const [isConnected, setIsConnected] = useState(null);
  const [appIsReady, setAppIsReady] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carrega as fontes personalizadas
  const [loaded, error] = useFonts({
    "Outfit-Bold": require("./assets/fonts/Outfit-Bold.ttf"),
    "Outfit-SemiBold": require("./assets/fonts/Outfit-SemiBold.ttf"),
    "Outfit-Regular": require("./assets/fonts/Outfit-Regular.ttf"),
  });

  // Verifica a conectividade com a internet e tenta restaurar a conexão
  const handleCheckConnectivity = useCallback(() => {
    checkConnectivity(
      setIsCheckingConnection,
      setIsConnected,
      setAppIsReady,
      setLocation,
      location,
      isInitialized,
      () =>
        handleConnectionRestored(
          setIsCheckingConnection,
          setIsConnected,
          setLocation,
          location,
          isInitialized,
        ),
    );
  }, [location, isInitialized]);

  // Efeito inicial para verificar conectividade
  useEffect(() => {
    async function prepareApp() {
      handleCheckConnectivity();
    }

    prepareApp();

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        if (!isConnected) {
          handleCheckConnectivity();
        }
      } else {
        setIsConnected(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [handleCheckConnectivity, isConnected]);

  // Gerencia a tela de splash e inicialização do app
  useEffect(() => {
    if ((loaded || error) && appIsReady) {
      SplashScreen.hideAsync().then(() => {
        setIsInitialized(true);
      });
    }
  }, [loaded, error, appIsReady]);

  const handleRetry = useCallback(() => {
    handleCheckConnectivity();
  }, [handleCheckConnectivity]);

  if (!loaded || !appIsReady) {
    return null;
  }

  // Tela de conexão perdida
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

  // Renderização principal do app
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
