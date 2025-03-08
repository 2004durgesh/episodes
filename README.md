# 📺 Episodes API

A simple API to fetch anime episode details, built on top of  
[Consumet.ts](https://github.com/consumet/consumet.ts) and [Airin](https://github.com/aniplaynow/airin).

If you find this useful, consider giving those projects a ⭐ — they deserve it! (and this repo too 😅)

---

## 🚀 Getting Started

### 📥 Clone the Repository

```sh
git clone https://github.com/2004durgesh/episodes.git
cd episodes
```

### 🔧 Install Dependencies

```sh
npm install
```

### ▶️ Run

```sh
npm run dev
```

---

## 📡 API Endpoints

### 🎯 Fetch Mappings

**GET**

```sh
http://localhost:3001/anime/mappings/{idType}/{id}
```

Supported ID types:
- anilist_id
- mal_id
- kitsu_id
- animeplanet_id
- anisearch_id
- anidb_id
- notifymoe_id
- livechart_id
- thetvdb_id
- imdb_id
- themoviedb_id

### 🎯 Fetch Episodes

**GET**

```sh
http://localhost:3001/anime/episodes/anilist/{anilistId}?provider=gogoanime # or zoro | animekai
```

```sh
http://localhost:3001/anime/episodes/mal/{malId}?provider=gogoanime # or zoro | animekai
```

**GET**

```sh
http://localhost:3001/movies/episodes/{tmdbId}?type={movie} # or tv
```

---

### 🎯 Fetch Streaming Links (only for movies endpoint)
> [!NOTE]  
> Defaults to embed=true 

#### Non-Embed Links
**GET**

```
http://localhost:3001/movies/tmdb/watch/{tmdbId}?episodeNumber={episodeNumber}&seasonNumber={seasonNumber}&type={type}&server={server}&embed=false
```
---

#### Embed Links
**GET**

```
http://localhost:3001/movies/tmdb/watch/{tmdbId}?episodeNumber={episodeNumber}&seasonNumber={seasonNumber}&type={type}&server={server}&embed=true
```
---

### 🎯 Fetch Servers (only for movies endpoint)
> [!NOTE]  
> Defaults to embed=true 

#### Non-Embed Servers
**GET**

```
http://localhost:3001/movies/tmdb/server/{tmdbId}?episodeNumber={episodeNumber}&seasonNumber={seasonNumber}&type={type}&embed=false
```
---

#### Embed Servers
**GET**

```
http://localhost:3001/movies/tmdb/server/{tmdbId}?episodeNumber={episodeNumber}&seasonNumber={seasonNumber}&type={type}&embed=true
```
---


#### Query Parameters

- **type**: `movie` or `tv`