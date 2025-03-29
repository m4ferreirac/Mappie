import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import AppMapView from "./AppMapView";
import Header from "./Header";
import SearchBar from "./SearchBar";
import { UserLocationContext } from "../../Context/UserLocationContext";
import GlobalApi from "../../Utils/GlobalApi";
import PlaceListView from "./PlaceListView";
import { SelectMarkerContext } from "../../Context/SelectMarkerContext";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import Colors from "../../Utils/Colors";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen() {
  const { location, setLocation, userLocation } =
    useContext(UserLocationContext);
  const [placeList, setPlaceList] = useState([]);
  const [selectedMaker, setSelectedMarker] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearSearchInput, setClearSearchInput] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (location) {
        setLoading(true);
        getNearByPlace();
      }
      setRefreshKey((prevKey) => prevKey + 1);
    }, [location]),
  );

  useEffect(() => {
    if (location) {
      setLoading(true);
      getNearByPlace();
    }
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

    GlobalApi.NewNearByPlace(data)
      .then((resp) => {
        if (resp.data?.places?.length > 0) {
          setPlaceList(resp.data.places);
        } else {
          setPlaceList([]);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  };

  const resetToUserLocation = async () => {
    setLoading(true);
    setClearSearchInput(true);
    setRefreshKey((prevKey) => prevKey + 1);

    try {
      if (userLocation) {
        setLocation(userLocation);
      } else {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          let currentLocation = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
        }
      }
    } catch (error) {
      console.error("Erro ao obter localização atual:", error);
      setLoading(false);
    } finally {
      setTimeout(() => setClearSearchInput(false), 100);
    }
  };

  const refreshData = () => {
    setLoading(true);
    getNearByPlace();
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <SelectMarkerContext.Provider value={{ selectedMaker, setSelectedMarker }}>
      <View style={{ flex: 1, height: "100%" }}>
        <View style={styles.headerContainer}>
          <Header />
          <SearchBar
            searchedLocation={(location) => {
              setLocation({
                latitude: location.lat,
                longitude: location.lng,
              });
              setRefreshKey((prevKey) => prevKey + 1);
            }}
            clearInput={clearSearchInput}
          />
          <View style={styles.refreshButtonContainer}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={resetToUserLocation}
            >
              <MaterialIcons name="refresh" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="large" color={Colors.PRIMARY} />
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Outfit-Regular",
                marginTop: 10,
              }}
            >
              Loading...
            </Text>
          </View>
        ) : (
          <>
            {placeList.length > 0 ? (
              <AppMapView placeList={placeList} key={`map-${refreshKey}`} />
            ) : null}
            <View style={styles.placeListContainer}>
              {placeList.length > 0 ? (
                <PlaceListView placeList={placeList} />
              ) : null}
            </View>
          </>
        )}
      </View>
    </SelectMarkerContext.Provider>
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
  refreshButtonContainer: {
    alignItems: "flex-end",
    marginTop: 10,
  },
  refreshButton: {
    backgroundColor: "#4285F4",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
