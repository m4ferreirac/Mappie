import { View, StyleSheet, Image } from "react-native";
import React from "react";

export default function Header() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images/Logo.png")}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logo: {
    width: 200,
    height: 45,
    objectFit: "contain",
  },
});
