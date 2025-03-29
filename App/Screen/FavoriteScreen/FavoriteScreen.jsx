import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Dimensions,
  RefreshControl,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import Colors from "../../Utils/Colors";
import { app } from "../../Utils/FirebaseConfig";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import PlaceItem from "../HomeScreen/PlaceItem";
import { useUser } from "@clerk/clerk-expo";
import Header from "../HomeScreen/Header";
import { useFocusEffect } from "@react-navigation/native";

export default function FavoriteScreen() {
  const screenWidth = Dimensions.get("window").width;
  const [loading, setLoading] = useState(false);

  const db = getFirestore(app);
  const { user } = useUser();
  const [favList, setFavList] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      user && getFav();
    }, [user]),
  );

  const getFav = async () => {
    setLoading(true);
    setFavList([]);

    try {
      const q = query(
        collection(db, "Favorites"),
        where("email", "==", user?.primaryEmailAddress?.emailAddress),
      );

      const querySnapshot = await getDocs(q);
      const favorites = [];
      querySnapshot.forEach((doc) => {
        favorites.push(doc.data());
      });
      setFavList(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.contentContainer}>
          <ActivityIndicator size={"large"} color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (favList.length === 0) {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.emptyText}>No favorites yet</Text>
          <RefreshControl
            refreshing={loading}
            onRefresh={getFav}
            colors={[Colors.PRIMARY]}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={favList}
        onRefresh={getFav}
        refreshing={loading}
        renderItem={({ item }) => (
          <View style={styles.placeItemContainer}>
            <PlaceItem place={item.place} isFav={true} markedFav={getFav} />
          </View>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header />
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  contentContainer: {
    height: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Outfit-Regular",
    marginTop: 10,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Outfit-Regular",
  },
  placeItemContainer: {
    width: Dimensions.get("window").width,
    alignItems: "center",
  },
});
