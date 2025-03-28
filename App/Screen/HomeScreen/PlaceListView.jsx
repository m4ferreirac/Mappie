import { View, FlatList, Dimensions } from "react-native";
import React, { useContext, useEffect, useRef } from "react";
import PlaceItem from "./PlaceItem";
import { SelectMarkerContext } from "../../Context/SelectMarkerContext";
import { Animated } from "react-native-maps";

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
            <PlaceItem place={item} />
          </View>
        )}
      />
    </View>
  );
}
