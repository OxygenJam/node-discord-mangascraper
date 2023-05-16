// Here we define our query as a multi-line string
// Storing it in a separate .graphql/.gql file is also possible
export const AniListQuery = `
query ($search: String) {
  Media (search: $search, type: MANGA) {
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