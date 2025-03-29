import {
  View,
  Text,
  Image,
  Dimensions,
  Pressable,
  Alert,
  Platform,
  ToastAndroid,
  Linking,
  StyleSheet,
} from "react-native";
import React from "react";
import Colors from "../../Utils/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getFirestore, doc, setDoc, deleteDoc } from "firebase/firestore";
import { app } from "../../Utils/FirebaseConfig";
import { useUser } from "@clerk/clerk-expo";

const GOOGLE_API = process.env.EXPO_PUBLIC_GOOGLE_API;

export default function PlaceItem({ place, isFav, markedFav }) {
  const PLACE_PHOTO_BASE_URL = "https://places.googleapis.com/v1/";

  const db = getFirestore(app);
  const { user } = useUser();

  const onSetFav = async (place) => {
    await setDoc(doc(db, "Favorites", place.id.toString()), {
      place: place,
      email: user?.primaryEmailAddress?.emailAddress,
    });
    markedFav();
    if (Platform.OS === "android") {
      ToastAndroid.show("Added to Favorites", ToastAndroid.TOP);
    } else {
      Alert.alert("Success", "Added to Favorites", [{ text: "OK" }], {
        cancelable: true,
      });
    }
  };

  const onRemoveFav = async (placeId) => {
    await deleteDoc(doc(db, "Favorites", placeId.toString()));
    markedFav();
    if (Platform.OS === "android") {
      ToastAndroid.show("Removed from Favorites", ToastAndroid.TOP);
    } else {
      Alert.alert("Success", "Removed from Favorites", [{ text: "OK" }], {
        cancelable: true,
      });
    }
  };

  const onDirectionClick = () => {
    if (place?.location?.latitude && place?.location?.longitude) {
      const lat = place.location.latitude;
      const lng = place.location.longitude;
      const label = encodeURIComponent(
        place?.displayName?.text ||
          place?.shortFormattedAddress ||
          "Destination",
      );

      if (Platform.OS === "android") {
        const googleMapsUrl = `google.navigation:q=${lat},${lng}`;

        Linking.canOpenURL(googleMapsUrl)
          .then((supported) => {
            if (supported) {
              Linking.openURL(googleMapsUrl);
            } else {
              const geoUrl = `geo:${lat},${lng}?q=${lat},${lng}(${label})`;

              Linking.canOpenURL(geoUrl)
                .then((geoSupported) => {
                  if (geoSupported) {
                    Linking.openURL(geoUrl);
                  } else {
                    Linking.openURL(
                      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                    );
                  }
                })
                .catch(() => {
                  Linking.openURL(
                    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                  );
                });
            }
          })
          .catch(() => {
            Linking.openURL(
              `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            );
          });
      } else {
        const url = `maps://app?daddr=${lat},${lng}&ll=${lat},${lng}&q=${label}`;

        Linking.canOpenURL(url)
          .then((supported) => {
            if (supported) {
              Linking.openURL(url);
            } else {
              Linking.openURL(
                `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
              );
            }
          })
          .catch(() => {
            Linking.openURL(
              `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            );
          });
      }
    } else {
      const address = encodeURIComponent(
        place?.shortFormattedAddress || place?.formattedAddress || "",
      );

      if (address) {
        if (Platform.OS === "android") {
          const geoUrl = `geo:0,0?q=${address}`;

          Linking.canOpenURL(geoUrl)
            .then((supported) => {
              if (supported) {
                Linking.openURL(geoUrl);
              } else {
                Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${address}`,
                );
              }
            })
            .catch(() => {
              Linking.openURL(
                `https://www.google.com/maps/search/?api=1&query=${address}`,
              );
            });
        } else {
          Linking.openURL(`maps://app?q=${address}`).catch(() => {
            Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${address}`,
            );
          });
        }
      } else {
        Alert.alert(
          "Navigation Error",
          "Cannot navigate to this location due to missing information.",
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <View>
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
          style={styles.image}
        />
        {!isFav ? (
          <Pressable
            style={styles.favoriteButton}
            onPress={() => onSetFav(place)}
          >
            <Ionicons name="heart-outline" size={40} color={Colors.WHITE} />
          </Pressable>
        ) : (
          <Pressable
            style={styles.favoriteButton}
            onPress={() => onRemoveFav(place.id)}
          >
            <Ionicons name="heart-sharp" size={40} color="red" />
          </Pressable>
        )}
      </View>
      <View style={styles.detailsContainer}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
          {place.displayName?.text}
        </Text>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.address}>
          {place?.shortFormattedAddress}
        </Text>
        <View style={styles.footerContainer}>
          <View>
            <Text style={styles.connectorsLabel}>Connectors</Text>
            <Text style={styles.connectorsCount}>
              {place?.evChargeOptions?.connectorCount} Points
            </Text>
          </View>
          <Pressable
            style={styles.directionButton}
            onPress={() => onDirectionClick()}
          >
            <FontAwesome name="location-arrow" size={25} color="white" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    margin: 5,
    borderRadius: 10,
    width: Dimensions.get("screen").width * 0.9,
  },
  image: {
    width: "100%",
    borderRadius: 10,
    height: 150,
  },
  favoriteButton: {
    position: "absolute",
    margin: 5,
    right: 0,
  },
  detailsContainer: {
    padding: 15,
  },
  title: {
    fontSize: 23,
    fontFamily: "Outfit-SemiBold",
  },
  address: {
    color: Colors.GRAY,
    fontFamily: "Outfit-Regular",
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  connectorsLabel: {
    fontSize: 16,
    color: Colors.GRAY,
    fontFamily: "Outfit-Regular",
  },
  connectorsCount: {
    color: Colors.BLACK,
    fontSize: 20,
    fontFamily: "Outfit-SemiBold",
  },
  directionButton: {
    marginTop: 5,
    padding: 12,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 6,
    paddingHorizontal: 14,
  },
});
