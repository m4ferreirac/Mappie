import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../Utils/Colors.js";

export default function NoConnectionScreen({ onRetry, isRetrying }) {
  const [timeUntilRetry, setTimeUntilRetry] = useState(5);
  const retryTimeoutRef = useRef(null);

  useEffect(() => {
    let timer;

    if (!isRetrying) {
      timer = setInterval(() => {
        setTimeUntilRetry((prev) => {
          const newValue = prev - 1;

          if (newValue <= 0) {
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
            }

            retryTimeoutRef.current = setTimeout(() => {
              onRetry();
            }, 0);

            return 5;
          }

          return newValue;
        });
      }, 1000);
    } else {
      setTimeUntilRetry(5);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [isRetrying, onRetry]);

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline" size={80} color={Colors.PRIMARY} />
      <Text style={styles.title}>No Internet Connection</Text>
      <Text style={styles.message}>
        This app requires an internet connection to function properly.
      </Text>

      <View style={styles.statusContainer}>
        {isRetrying ? (
          <>
            <ActivityIndicator size="small" color={Colors.PRIMARY} />
            <Text style={styles.statusText}>Checking connection...</Text>
          </>
        ) : (
          <Text style={styles.statusText}>
            Checking again in {timeUntilRetry} seconds...
          </Text>
        )}
      </View>

      <Text style={styles.infoText}>
        Connection will be automatically detected when available.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Outfit-Bold",
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    fontFamily: "Outfit-Regular",
    textAlign: "center",
    marginBottom: 30,
    color: "#555",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: "80%",
  },
  statusText: {
    fontFamily: "Outfit-Regular",
    color: Colors.PRIMARY,
    fontSize: 15,
    textAlign: "center",
    marginLeft: 8,
  },
  infoText: {
    marginTop: 20,
    fontSize: 14,
    color: Colors.GRAY,
    fontFamily: "Outfit-Regular",
    textAlign: "center",
  },
});
