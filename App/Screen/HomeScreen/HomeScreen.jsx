import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import AppMapView from "./AppMapView";
import Header from "./Header";
import SearchBar from "./SearchBar";
import { UserLocationContext } from "../../Context/UserLocationContext";
import GlobalApi from "../../Utils/GlobalApi";
import PlaceListView from "./PlaceListView";
import { SelectMarkerContext } from "../../Context/SelectMarkerContext";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";

export default function HomeScreen() {
  const { location, setLocation, userLocation } =
    useContext(UserLocationContext);
  const [placeList, setPlaceList] = useState([]);
  const [selectedMaker, setSelectedMarker] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Função para obter a localização atual do usuário
  const resetToUserLocation = async () => {
    setLoading(true);

    try {
      // Se tivermos a localização real do usuário em contexto, usamos ela
      if (userLocation) {
        setLocation(userLocation);
      }
      // Caso contrário, tentamos obter a localização atual
      else {
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
    }
  };

  return (
    <SelectMarkerContext.Provider value={{ selectedMaker, setSelectedMarker }}>
      <View>
        <View style={styles.headerContainer}>
          <Header />
          <SearchBar
            searchedLocation={(location) =>
              setLocation({
                latitude: location.lat,
                longitude: location.lng,
              })
            }
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
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={{ marginTop: 80 }}
          />
        ) : (
          <>
            {placeList.length > 0 ? <AppMapView placeList={placeList} /> : null}
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
