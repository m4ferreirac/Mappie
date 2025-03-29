import { View, FlatList, Dimensions } from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
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

export default function PlaceListView({ placeList }) {
  const { setSelectedMarker, selectedMaker } = useContext(SelectMarkerContext);
  const flatListRef = useRef(null);
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    selectedMaker && scrollToIndex(selectedMaker);
  }, [selectedMaker]);

  const scrollToIndex = (index) => {
    flatListRef.current?.scrollToIndex({ animated: true, index });
  };

  const getItemLayout = (_, index) => ({
    length: Dimensions.get("window").width,
    offset: Dimensions.get("window").width * index,
    index,
  });

  const db = getFirestore(app);
  const { user } = useUser();
  const [favList, setFavList] = useState([]);

  useEffect(() => {
    user && getFav();
  }, [user]);

  const getFav = async () => {
    setFavList([]);
    const q = query(
      collection(db, "Favorites"),
      where("email", "==", user?.primaryEmailAddress?.emailAddress),
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setFavList((favList) => [...favList, doc.data()]);
    });
  };

  const isFav = (place) => {
    const result = favList.find((item) => item.place.id == place.id);
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
