import { Client, ID, Query, TablesDB } from "appwrite";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const tables = new TablesDB(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_TABLE_ID!;
const SAVED_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_SAVED_TABLE_ID!;

export const updateSearchCount = async (query: string, movie: Movie) => {
  // check if a record of that search has already been stored
  //if a document is found increment the searchCount field
  // if no document is found create a new document in Appwrite database => 1
  try {
    const existing = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.equal("searchTerm", query)],
    });

    if (existing.total > 0) {
      const row = existing.rows[0];
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: row.$id,
        data: {
          count: (row.count ?? 0) + 1,
        },
      });
    } else {
      await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: ID.unique(),
        data: {
          searchTerm: query,
          count: 1,
          poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          title: movie.title,
          movie_id: movie.id,
        },
      });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateSavedMovie = async (id: number, movie: Movie) => {
  try {
    // if a move is saved, check if the movie is already in the the table and saved. If it is saved, unsave it, else save it
    const existing = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: SAVED_TABLE_ID,
      queries: [Query.equal("movie_id", id)],
    });

    if (existing.total > 0) {
      const row = existing.rows[0];
      await tables.deleteRow({
        databaseId: DATABASE_ID,
        tableId: SAVED_TABLE_ID,
        rowId: row.$id,
      });
      return false;
    } else {
      await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: SAVED_TABLE_ID,
        rowId: ID.unique(),
        data: {
          is_movie_saved: true,
          poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          title: movie.title,
          movie_id: movie.id,
        },
      });
      return true;
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la sauvegarde :", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const existing = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.limit(5), Query.orderDesc("count")],
    });

    return existing.rows as unknown as TrendingMovie[];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const getSavedMovies = async (): Promise<SavedMovie[] | undefined> => {
  try {
    const existing = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: SAVED_TABLE_ID,
    });

    return existing.rows as unknown as SavedMovie[];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
