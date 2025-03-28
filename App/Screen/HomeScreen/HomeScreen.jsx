import { StyleSheet, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import AppMapView from "./AppMapView";
import Header from "./Header";
import SearchBar from "./SearchBar";
import { UserLocationContext } from "../../Context/UserLocationContext";
import GlobalApi from "../../Utils/GlobalApi";
import PlaceListView from "./PlaceListView";

export default function HomeScreen() {
  const { location, setlocation } = useContext(UserLocationContext);
  const [placeList, setPlaceList] = useState([]);

  useEffect(() => {
    location && getNearByPlace();
  }, [location]);

  const getNearByPlace = () => {
    const data = {
      includedTypes: ["electric_vehicle_charging_station"],
      maxResultCount: 10,
      locationRestriction: {
        circle: {
          center: {
            latitude: location?.latitude,
            longitude: location?.longitude,
          },
          radius: 5000.0,
        },
      },
    };

    GlobalApi.NewNearByPlace(data).then((resp) => {
      setPlaceList(resp.data?.places);
    });
  };

  return (
    <View>
      <View style={styles.headerContainer}>
        <Header />
        <SearchBar searchedLocation={(location) => console.log(location)} />
      </View>
      <AppMapView />
      <View style={styles.placeListContainer}>
        {placeList && <PlaceListView placeList={placeList} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    zIndex: 10,
    padding: 10,
    width: "100%",
    paddingHorizontal: 20,
  },
  placeListContainer: {
    position: "absolute",
    bottom: 0,
    zIndex: 10,
    width: "100%",
  },
});
