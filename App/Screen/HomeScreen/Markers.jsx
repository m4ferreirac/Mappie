import React, { useContext } from "react";
import { Image, Platform, View, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import { SelectMarkerContext } from "../../Context/SelectMarkerContext";

export default function Markers({ index, place }) {
  const { selectedMaker, setSelectedMarker } = useContext(SelectMarkerContext);

  return (
    place && (
      <Marker
        coordinate={{
          latitude: place.location?.latitude,
          longitude: place.location?.longitude,
        }}
        onPress={() => setSelectedMarker(index)}
        {...(Platform.OS === "android"
          ? { icon: require("../../../assets/images/marker.png") }
          : {})}
      >
        {Platform.OS === "ios" && (
          <View style={styles.markerContainer}>
            <Image
              source={require("../../../assets/images/marker.png")}
              style={styles.markerImage}
            />
          </View>
        )}
      </Marker>
    )
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  markerImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
});
