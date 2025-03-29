import React from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import Colors from "../../Utils/Colors";
import { useOAuth } from "@clerk/clerk-expo";
import { useWarmUpBrowser } from "../../../hooks/warmUpBrowser";
import Header from "../HomeScreen/Header";
import { FontAwesome } from "@expo/vector-icons";

WebBrowser.maybeCompleteAuthSession();

const { height } = Dimensions.get("window");

export default function LoginScreen() {
  useWarmUpBrowser();

  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: startFacebookOAuthFlow } = useOAuth({
    strategy: "oauth_facebook",
  });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({
    strategy: "oauth_apple",
  });

  const onPressGoogle = async () => {
    try {
      const { createdSessionId, setActive } = await startGoogleOAuthFlow();
      if (createdSessionId) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error("Google OAuth error", err);
    }
  };

  const onPressFacebook = async () => {
    try {
      const { createdSessionId, setActive } = await startFacebookOAuthFlow();
      if (createdSessionId) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error("Facebook OAuth error", err);
    }
  };

  const onPressApple = async () => {
    try {
      const { createdSessionId, setActive } = await startAppleOAuthFlow();
      if (createdSessionId) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error("Apple OAuth error", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Image
            source={require("../../../assets/images/login-bg.png")}
            style={styles.bgImage}
          />
          <View style={styles.textContainer}>
            <Text style={styles.heading}>
              Your Ultimate EV Charging Station Finder App
            </Text>
            <Text style={styles.desc}>
              Find EV Charging station near you, plan trip and so much more in
              just one click
            </Text>

            <TouchableOpacity style={styles.button} onPress={onPressGoogle}>
              <FontAwesome
                name="google"
                size={20}
                color={Colors.WHITE}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Login with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.facebookButton]}
              onPress={onPressFacebook}
            >
              <FontAwesome
                name="facebook"
                size={22}
                color={Colors.WHITE}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Login with Facebook</Text>
            </TouchableOpacity>

            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={[styles.button, styles.appleButton]}
                onPress={onPressApple}
              >
                <FontAwesome
                  name="apple"
                  size={22}
                  color={Colors.WHITE}
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Login with Apple</Text>
              </TouchableOpacity>
            )}

            <Text
              style={[
                styles.privacyText,
                Platform.OS === "ios" ? {} : styles.androidPrivacyText,
              ]}
            >
              By continuing, you agree to our{"\n"}
              <Text style={styles.privacyLink}>Terms of Service</Text> and{" "}
              <Text style={styles.privacyLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  contentContainer: {
    alignItems: "center",
  },
  bgImage: {
    width: "100%",
    height: 260,
    resizeMode: "contain",
  },
  textContainer: {
    padding: 20,
    alignItems: "center",
    width: "100%",
  },
  heading: {
    fontSize: 25,
    fontFamily: "Outfit-Bold",
    textAlign: "center",
    marginTop: 20,
  },
  desc: {
    fontSize: 17,
    fontFamily: "Outfit-Regular",
    marginTop: 15,
    textAlign: "center",
    color: Colors.GRAY,
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    width: "90%",
    borderRadius: 99,
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  facebookButton: {
    backgroundColor: "#4267B2",
    marginBottom: Platform.OS === "ios" ? 0 : 15,
  },
  appleButton: {
    backgroundColor: "#000",
    marginTop: 15,
    marginBottom: 15,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: Colors.WHITE,
    textAlign: "center",
    fontFamily: "Outfit-Regular",
    fontSize: 17,
  },
  privacyText: {
    color: Colors.GRAY,
    textAlign: "center",
    fontFamily: "Outfit-Regular",
    fontSize: 13,
    marginTop: 5,
    paddingHorizontal: 20,
  },
  androidPrivacyText: {
    marginTop: 5,
  },
  privacyLink: {
    color: Colors.PRIMARY,
    fontFamily: "Outfit-Medium",
  },
});
