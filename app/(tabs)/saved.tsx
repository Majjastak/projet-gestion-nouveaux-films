import SavedCard from "@/components/SavedCard";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { getSavedMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";

const Saved = () => {
  const {
    data: SavedMovies,
    loading: savedLoading,
    error: savedError,
    refetch,
  } = useFetch(getSavedMovies);

  useFocusEffect(
    useCallback(() => {
      refetch(); // relance la récupération des films à chaque retour sur la page
    }, [])
  );

  return (
    <>
      {SavedMovies && SavedMovies.length > 0 ? (
        <View className="flex-1 bg-primary">
          <Image source={images.bg} className="absolute w-full z-0" />
          <ScrollView
            className="flex-1 px-5"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              minHeight: "100%",
              paddingBottom: 10,
            }}
          >
            <Image
              source={icons.logo}
              className="w-12 h-10 mt-20 mb-5 mx-auto"
            />

            {savedLoading ? (
              <ActivityIndicator
                size={"large"}
                color="#0000ff"
                className="mt-10 self-center"
              />
            ) : savedError ? (
              <Text>Error: {savedError?.message}</Text>
            ) : (
              <View className="flex-1 mt-5">
                <SearchBar
                  onPress={() => router.push("/search")}
                  placeholder="Search for a movie"
                />

                <>
                  <Text className="text-lg text-white font-bold mt-5 mb-3">
                    Saved Movies
                  </Text>

                  <FlatList
                    scrollEnabled={false}
                    data={SavedMovies}
                    renderItem={({ item }) => <SavedCard movie={item} />}
                    keyExtractor={(item) => item.movie_id.toString()}
                    numColumns={3}
                    refreshing={savedLoading}
                    onRefresh={refetch}
                    columnWrapperStyle={{
                      justifyContent: "flex-start",
                      gap: 20,
                      paddingRight: 5,
                      marginBottom: 10,
                    }}
                    className="mt-2 pb-32"
                  />
                </>
              </View>
            )}
          </ScrollView>
        </View>
      ) : (
        <View className="bg-primary flex-1 px-10">
          <View className="flex justify-center items-center flex-1 flex-col gap-5">
            <Image source={icons.save} className="size-10" tintColor="#Fff" />
            <Text className="text-gray-500 w-full justify-center items-center text-center">
              Save a movie by clicking the bookmark button in a movie&apos;s
              detail page.
            </Text>
          </View>
        </View>
      )}
    </>
  );
};

export default Saved;
