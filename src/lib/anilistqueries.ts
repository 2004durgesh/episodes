export const animeinfo: string = `
  query($id: Int) {
    Media(id: $id) {
      idMal
      type
      format
      externalLinks {
        site
        url
      }
      title {
        romaji
        english
      }
      status
      season
      episodes
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      coverImage {
        extraLarge
        large
        medium
      }
    }
  }
`;
