import { icons } from "@/constants/icons";
import { fetchMovieDetails } from "@/services/api";
import { updateSavedMovie } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { Client, Query, TablesDB } from "appwrite";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const tables = new TablesDB(client);
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const SAVED_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_SAVED_TABLE_ID!;

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => {
  return (
    <View className="flex-col items-start justify-center">
      <Text className="text-light-200 font-normal text-sm mt-5">{label}</Text>
      <Text className="text-light-100 font-normal text-sm mt-2">
        {value || "N/A"}
      </Text>
    </View>
  );
};

const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const { data: movie } = useFetch(() => fetchMovieDetails(id as string));
  const [isSaved, setIsSaved] = useState(false);

  // Vérifie si le film est déjà sauvegardé
  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const res = await tables.listRows({
          databaseId: DATABASE_ID,
          tableId: SAVED_TABLE_ID,
          queries: [Query.equal("movie_id", Number(id))],
        });
        setIsSaved(res.total > 0);
      } catch (err) {
        console.error("Erreur checkIfSaved:", err);
      }
    };
    if (id) checkIfSaved();
  }, [id]);

  const handleSavePress = async () => {
    try {
      const result = await updateSavedMovie(Number(id), movie);
      setIsSaved(result);
    } catch (err) {
      console.error("Erreur handleSavePress:", err);
    }
  };

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
            }}
            className="w-full h-[450px]"
            resizeMode="stretch"
          />
        </View>

        <View className="flex-col items-start justify-center mt-5 px-5">
          <View className="flex flex-row justify-between items-center w-full">
            <Text className="text-white font-bold text-xl">{movie?.title}</Text>

            <TouchableOpacity onPress={handleSavePress}>
              <Image
                source={icons.save}
                className="size-6"
                tintColor={isSaved ? "#00BFFF" : "#FFFFFF"} // ✅ bleu clair si sauvegardé
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {movie?.release_date?.split("-")[0]}
            </Text>
            <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
          </View>

          <View className="flex-row items-center px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />
            <Text className="text-white font-bold text-sm">
              {Math.round(movie?.vote_average ?? 0)}/10
            </Text>
            <Text className="text-light-200 text-sm">
              ({movie?.vote_count} votes)
            </Text>
          </View>

          <MovieInfo label="Overview" value={movie?.overview} />
          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g) => g.name).join(" - ") || "N/A"}
          />

          <View className="flex flex-row justify-between w-1/2">
            <MovieInfo
              label="Budget"
              value={
                movie?.budget
                  ? `$${movie.budget / 1000000} million`
                  : "Budget inconnu"
              }
            />
            <MovieInfo
              label="Revenue"
              value={
                movie?.revenue
                  ? `$${Math.round(movie?.revenue) / 1000000} million`
                  : "Bénéfices inconnus"
              }
            />
          </View>

          <MovieInfo
            label="Production Companies"
            value={
              movie?.production_companies.map((c) => c.name).join(" - ") ||
              "N/A"
            }
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor={"#fff"}
        />
        <Text className="text-white font-semibold text-base">Go back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MovieDetails;
