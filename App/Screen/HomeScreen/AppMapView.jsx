import { StyleSheet, View, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewStyle from "../../Utils/MapViewStyle.json";
import React, { useContext } from "react";
import { UserLocationContext } from "../../Context/UserLocationContext";

export default function AppMapView() {
  const { location, setLocation } = useContext(UserLocationContext);

  return (
    location?.latitude && (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          customMapStyle={MapViewStyle}
          region={{
            latitude: location?.latitude,
            longitude: location?.longitude,
            latitudeDelta: 0.0422,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location?.latitude,
              longitude: location?.longitude,
            }}
          >
            <Image
              source={require("../../../assets/images/car-marker.png")}
              style={{
                width: 25,
                height: 50,
              }}
            />
          </Marker>
        </MapView>
      </View>
    )
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
