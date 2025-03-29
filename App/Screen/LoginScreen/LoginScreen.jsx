import React from "react";
import { Text, View, Image, StyleSheet, TouchableOpacity } from "react-native";
import * as WebBrowser from "expo-web-browser";
import Colors from "../../Utils/Colors";
import { useOAuth } from "@clerk/clerk-expo";
import { useWarmUpBrowser } from "../../../hooks/warmUpBrowser";
import Header from "../HomeScreen/Header";
import { FontAwesome } from "@expo/vector-icons";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  useWarmUpBrowser();

  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: startFacebookOAuthFlow } = useOAuth({
    strategy: "oauth_facebook",
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

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header />
      </View>

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

          <Text style={styles.privacyText}>
            By continuing, you agree to our{"\n"}
            <Text style={styles.privacyLink}>Terms of Service</Text> and{" "}
            <Text style={styles.privacyLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    padding: 10,
    width: "100%",
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  bgImage: {
    width: "100%",
    height: 260,
    objectFit: "contain",
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
    marginTop: 15,
    marginBottom: 20,
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
    marginTop: 10,
  },
  privacyLink: {
    color: Colors.PRIMARY,
    fontFamily: "Outfit-Medium",
  },
});
