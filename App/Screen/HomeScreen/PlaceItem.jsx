import { View, Text, Image, Dimensions } from "react-native";
import React from "react";
import Colors from "../../Utils/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const GOOGLE_API = process.env.EXPO_PUBLIC_GOOGLE_API;

export default function PlaceItem({ place }) {
  const PLACE_PHOTO_BASE_URL = "https://places.googleapis.com/v1/";

  return (
    <View
      style={{
        backgroundColor: Colors.WHITE,
        margin: 5,
        borderRadius: 10,
        width: Dimensions.get("screen").width * 0.9,
      }}
    >
      <Image
        source={
          place?.photos
            ? {
                uri:
                  PLACE_PHOTO_BASE_URL +
                  place?.photos[0]?.name +
                  "/media?key=" +
                  GOOGLE_API +
                  "&maxHeightPx=800&maxWidthPx=1200",
              }
            : require("../../../assets/images/login-bg.png")
        }
        style={{
          width: "100%",
          borderRadius: 10,
          height: 130,
        }}
      />
      <View style={{ padding: 15 }}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            fontSize: 23,
            fontFamily: "Outfit-SemiBold",
          }}
        >
          {place.displayName?.text}
        </Text>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            color: Colors.GRAY,
            fontFamily: "Outfit-Regular",
          }}
        >
          {place?.shortFormattedAddress}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 16,
                color: Colors.GRAY,
                fontFamily: "Outfit-Regular",
              }}
            >
              Connectors
            </Text>
            <Text
              style={{
                color: Colors.BLACK,
                fontSize: 20,
                fontFamily: "Outfit-SemiBold",
              }}
            >
              {place?.evChargeOptions?.connectorCount} Points
            </Text>
          </View>
          <View
            style={{
              marginTop: 5,
              padding: 12,
              backgroundColor: Colors.PRIMARY,
              borderRadius: 6,
              paddingHorizontal: 14,
            }}
          >
            <FontAwesome name="location-arrow" size={25} color="white" />
          </View>
        </View>
      </View>
    </View>
  );
}
