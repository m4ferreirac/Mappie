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
import Colors from "../../Utils/Colors";
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

export default function PlaceListView({ placeList, onRefresh }) {
  const { setSelectedMarker, selectedMaker } = useContext(SelectMarkerContext);
  const flatListRef = useRef(null);
  const screenWidth = Dimensions.get("window").width;
  const [refreshing, setRefreshing] = useState(false);

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
    }
  };

  const isFav = (place) => {
    const result = favList.find((item) => item.place.id === place.id);
    return result ? true : false;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await getFav();

      if (onRefresh) {
        onRefresh();
      }
    } finally {
      setRefreshing(false);
    }
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.PRIMARY]}
            tintColor={Colors.PRIMARY}
            title="Refreshing..."
            titleColor={Colors.PRIMARY}
          />
        }
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
