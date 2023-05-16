// Here we define our query as a multi-line string
// Storing it in a separate .graphql/.gql file is also possible
export const AniListQuery = `
query ($search: String) { # Define which variables will be used in the query (id)
  Media (search: $search, type: MANGA) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
    id
    title {
      romaji
      english
      native
    }
    coverImage
    description
    status
  }
}
`;

export type MangaResult = {
    id: number,
    title: {
        romaji: string,
        english: string,
        native: string
    },
    coverImage: {
        extraLarge: string,
        large: string,
        medium: string,
        color: string
    },
    description: string,
    status: string
};