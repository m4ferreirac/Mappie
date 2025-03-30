import { View, FlatList, Dimensions, RefreshControl } from "react-native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import PlaceItem from "./PlaceItem";
import { SelectMarkerContext } from "../../Context/SelectMarkerContext";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { app } from "../../Utils/FirebaseConfig";
import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";

export default function PlaceListView({ placeList }) {
  const { setSelectedMarker, selectedMaker } = useContext(SelectMarkerContext);
  const flatListRef = useRef(null);
  const screenWidth = Dimensions.get("window").width;

  const db = getFirestore(app);
  const { user } = useUser();
  const [favList, setFavList] = useState([]);

  useEffect(() => {
    selectedMaker && scrollToIndex(selectedMaker);
  }, [selectedMaker]);

  useEffect(() => {
    user && getFav();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      user && getFav();
    }, [user]),
  );

  const scrollToIndex = (index) => {
    flatListRef.current?.scrollToIndex({ animated: true, index });
  };

  const getItemLayout = (_, index) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  });

  const getFav = async () => {
    setFavList([]);

    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      const userEmail = user.primaryEmailAddress.emailAddress;
      const userFavoritesRef = collection(db, "Favorites", userEmail, "Places");

      const querySnapshot = await getDocs(userFavoritesRef);
      const favorites = [];

      querySnapshot.forEach((doc) => {
        favorites.push(doc.data());
      });

      setFavList(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const isFav = (place) => {
    const result = favList.find((item) => item.place.id === place.id);
    return result ? true : false;
  };

  return (
    <View style={{ alignItems: "center" }}>
      <FlatList
        data={placeList}
        horizontal
        pagingEnabled
        ref={flatListRef}
        getItemLayout={getItemLayout}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ width: screenWidth, alignItems: "center" }}>
            <PlaceItem
              place={item}
              isFav={isFav(item)}
              markedFav={() => getFav()}
            />
          </View>
        )}
      />
    </View>
  );
}
