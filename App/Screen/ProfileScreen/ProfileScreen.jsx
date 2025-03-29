import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser, useAuth } from "@clerk/clerk-expo";
import Colors from "../../Utils/Colors";
import Header from "../HomeScreen/Header";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity style={styles.profileImage}>
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  style={styles.userImage}
                />
              ) : (
                <View style={styles.initialCircle}>
                  <Text style={styles.initialText}>
                    {user?.fullName?.[0] || "U"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.fullName || "User"}</Text>
          <Text style={styles.userEmail}>
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleSignOut}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.WHITE} size="small" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={22} color={Colors.WHITE} />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    padding: 10,
    width: "100%",
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 25,
  },
  profileImageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.LIGHT_GRAY,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.PRIMARY,
    overflow: "hidden",
  },
  userImage: {
    width: "100%",
    height: "100%",
  },
  initialCircle: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.PRIMARY,
  },
  initialText: {
    fontSize: 40,
    color: Colors.WHITE,
    fontFamily: "Outfit-Bold",
  },
  userName: {
    fontSize: 24,
    fontFamily: "Outfit-Bold",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: "Outfit-Regular",
    color: Colors.GRAY,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    width: "100%",
    borderRadius: 99,
  },
  logoutText: {
    fontSize: 17,
    marginLeft: 10,
    fontFamily: "Outfit-Medium",
    color: Colors.WHITE,
  },
});
