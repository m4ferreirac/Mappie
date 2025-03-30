import { StyleSheet, View, Image, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";
import React, { useContext } from "react";
import { UserLocationContext } from "../../Context/UserLocationContext";
import Markers from "./Markers";

export default function AppMapView({ placeList }) {
  const { location, setLocation } = useContext(UserLocationContext);

  const getMarkerStyle = () => {
    if (Platform.OS === "android") {
      return {
        width: 20,
        height: 30,
      };
    }

    return {
      width: 25,
      height: 50,
    };
  };

  return (
    location?.latitude && (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={{
            latitude: location?.latitude,
            longitude: location?.longitude,
            latitudeDelta: 0.0522,
            longitudeDelta: 0.0421,
          }}
        >
          {location ? (
            <Marker
              coordinate={{
                latitude: location?.latitude,
                longitude: location?.longitude,
              }}
            >
              <Image
                source={require("../../../assets/images/car-marker.png")}
                style={getMarkerStyle()}
                resizeMode="contain"
              />
            </Marker>
          ) : null}

          {placeList &&
            placeList.map((item, index) => (
              <Markers key={index} place={item} index={index} />
            ))}
        </MapView>
      </View>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
