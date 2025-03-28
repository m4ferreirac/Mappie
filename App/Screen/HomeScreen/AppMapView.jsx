import { StyleSheet, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import MapViewStyle from "../../Utils/MapViewStyle.json";
import React from "react";

export default function AppMapView() {
  return (
    <View style={styles.container}>
      <MapView style={styles.map} customMapStyle={MapViewStyle} />
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
