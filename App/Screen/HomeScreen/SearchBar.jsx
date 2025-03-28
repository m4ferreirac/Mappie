import { View } from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Colors from "../../Utils/Colors";

export default function SearchBar({ searchedLocation }) {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        marginTop: 15,
        paddingHorizontal: 5,
        backgroundColor: Colors.WHITE,
        borderRadius: 6,
      }}
    >
      <Ionicons
        name="location-sharp"
        size={24}
        color={Colors.GRAY}
        style={{ paddingTop: 10 }}
      />
      <GooglePlacesAutocomplete
        placeholder="Search EV Charging Station"
        enablePoweredByContainer={false}
        fetchDetails={true}
        onPress={(data, details = null) => {
          searchedLocation(details?.geometry?.location);
        }}
        query={{
          key: "AIzaSyASSmgfmvpXJuPf1OmbGucmYTHDBICoA-o",
          language: "en",
        }}
      />
    </View>
  );
}
