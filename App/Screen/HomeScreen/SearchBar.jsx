import { View, StyleSheet } from "react-native";
import React, { useRef, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Colors from "../../Utils/Colors";

const GOOGLE_API = process.env.EXPO_PUBLIC_GOOGLE_API;

export default function SearchBar({ searchedLocation, clearInput }) {
  const placesRef = useRef(null);

  useEffect(() => {
    if (clearInput && placesRef.current) {
      placesRef.current.clear();
    }
  }, [clearInput]);

  return (
    <View style={styles.container}>
      <Ionicons
        name="location-sharp"
        size={24}
        color={Colors.GRAY}
        style={styles.icon}
      />
      <GooglePlacesAutocomplete
        ref={placesRef}
        placeholder="Search EV Charging Station"
        enablePoweredByContainer={false}
        fetchDetails={true}
        onPress={(data, details = null) => {
          searchedLocation(details?.geometry?.location);
        }}
        query={{
          key: GOOGLE_API,
          language: "en",
        }}
        styles={autoCompleteStyles}
      />
    </View>
  );
}

const autoCompleteStyles = {
  container: {
    flex: 1,
  },
  textInput: {
    height: 44,
    backgroundColor: "transparent",
    fontSize: 16,
    borderRadius: 0,
  },
  listView: {
    backgroundColor: Colors.WHITE,
    borderRadius: 6,
    marginTop: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  row: {
    padding: 13,
    flexDirection: "row",
  },
  description: {
    fontSize: 15,
  },
  separator: {
    height: 0.5,
    backgroundColor: "#EAEAEA",
  },
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    marginTop: 15,
    paddingHorizontal: 5,
    backgroundColor: Colors.WHITE,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  icon: {
    paddingTop: 10,
    marginRight: 5,
  },
});
