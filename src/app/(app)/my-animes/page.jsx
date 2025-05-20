"use client"
import { useState, useEffect } from "react"
import { useAnime } from "@/store/AnimeContext"
import { useAuth } from "@/store/AuthContext"
import Link from "next/link"
import Image from "next/image"
import { Loader2, X, Search, Filter, SortAsc, Grid, List, Calendar, Star, Clock, Film } from 'lucide-react'

export default function MyAnimeListPage() {
  const { user } = useAuth()
  const { animeList, loading, error, removeAnimeFromList } = useAnime()
  const [filteredList, setFilteredList] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("recently-added")
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const [isRemoving, setIsRemoving] = useState({})
  const [activeFilter, setActiveFilter] = useState("all")

  // Apply filters and sorting
  useEffect(() => {
    if (!animeList) return

    let result = [...animeList]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        anime => 
          anime.title.romaji.toLowerCase().includes(query) || 
          (anime.title.english && anime.title.english.toLowerCase().includes(query))
      )
    }

    // Apply category filter
    if (activeFilter !== "all") {
      result = result.filter(anime => anime.status === activeFilter)
    }

    // Apply sorting
    switch (sortOption) {
      case "recently-added":
        result.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        break
      case "title-asc":
        result.sort((a, b) => a.title.romaji.localeCompare(b.title.romaji))
        break
      case "title-desc":
        result.sort((a, b) => b.title.romaji.localeCompare(a.title.romaji))
        break
      case "score-desc":
        result.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
        break
      case "release-date":
        result.sort((a, b) => {
          const dateA = a.startDate.year ? new Date(a.startDate.year, a.startDate.month - 1, a.startDate.day) : new Date(0)
          const dateB = b.startDate.year ? new Date(b.startDate.year, b.startDate.month - 1, b.startDate.day) : new Date(0)
          return dateB - dateA
        })
        break
    }

    setFilteredList(result)
  }, [animeList, searchQuery, sortOption, activeFilter])

  const handleRemoveAnime = async (animeId) => {
    setIsRemoving(prev => ({ ...prev, [animeId]: true }))
    try {
      await removeAnimeFromList(animeId)
    } catch (error) {
      console.error("Error removing anime:", error)
    } finally {
      setIsRemoving(prev => ({ ...prev, [animeId]: false }))
    }
  }

  // Stats calculations
  const totalAnime = animeList?.length || 0
  const totalEpisodes = animeList?.reduce((sum, anime) => sum + (anime.episodes || 0), 0) || 0
  const statusCounts = animeList?.reduce((counts, anime) => {
    counts[anime.status] = (counts[anime.status] || 0) + 1
    return counts
  }, {}) || {}

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">My Anime List</h1>
        <p className="text-gray-400 mb-4">Please log in to view your anime list.</p>
        <Link href="/sign-in" className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
          Log In
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400">Loading your anime list...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error Loading Anime List</h1>
        <p className="text-gray-400 mb-4">{error.message}</p>
        <Link href="/" className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
          Return Home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Anime List</h1>
            <p className="text-gray-400 mt-1">Manage your personal anime collection</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <button 
              onClick={() => setViewMode("grid")} 
              className={`p-2 rounded-md ${viewMode === "grid" ? "bg-purple-600" : "bg-gray-800"}`}
              aria-label="Grid view"
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode("list")} 
              className={`p-2 rounded-md ${viewMode === "list" ? "bg-purple-600" : "bg-gray-800"}`}
              aria-label="List view"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <Film className="h-5 w-5 text-purple-400 mr-2" />
              <h3 className="text-gray-400 text-sm">Total Anime</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{totalAnime}</p>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-purple-400 mr-2" />
              <h3 className="text-gray-400 text-sm">Total Episodes</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{totalEpisodes}</p>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-purple-400 mr-2" />
              <h3 className="text-gray-400 text-sm">Completed</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{statusCounts["FINISHED"] || 0}</p>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-purple-400 mr-2" />
              <h3 className="text-gray-400 text-sm">Currently Airing</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{statusCounts["RELEASING"] || 0}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-full text-sm ${activeFilter === "all" ? "bg-purple-600" : "bg-gray-800"}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveFilter("RELEASING")}
              className={`px-3 py-1.5 rounded-full text-sm ${activeFilter === "RELEASING" ? "bg-purple-600" : "bg-gray-800"}`}
            >
              Airing
            </button>
            <button 
              onClick={() => setActiveFilter("FINISHED")}
              className={`px-3 py-1.5 rounded-full text-sm ${activeFilter === "FINISHED" ? "bg-purple-600" : "bg-gray-800"}`}
            >
              Completed
            </button>
            <button 
              onClick={() => setActiveFilter("NOT_YET_RELEASED")}
              className={`px-3 py-1.5 rounded-full text-sm ${activeFilter === "NOT_YET_RELEASED" ? "bg-purple-600" : "bg-gray-800"}`}
            >
              Upcoming
            </button>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-md py-1.5 pl-9 pr-4 text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              />
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none bg-gray-800 border border-gray-700 rounded-md py-1.5 pl-9 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="recently-added">Recently Added</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="score-desc">Highest Score</option>
                <option value="release-date">Release Date</option>
              </select>
              <SortAsc className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredList.length === 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
            {searchQuery || activeFilter !== "all" ? (
              <>
                <p className="text-gray-300 mb-4">No anime found matching your filters.</p>
                <button 
                  onClick={() => {
                    setSearchQuery("")
                    setActiveFilter("all")
                  }}
                  className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-300 mb-4">Your anime list is empty.</p>
                <Link href="/" className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
                  Browse Anime
                </Link>
              </>
            )}
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && filteredList.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredList.map((anime) => (
              <div key={anime.id} className="group bg-gray-800/50 border border-gray-700 hover:border-purple-500 rounded-lg overflow-hidden transition-all duration-300">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Link href={`/anime/${anime.id}`}>
                    <div className="w-full h-full">
                      <img
                        src={anime.coverImage || "/placeholder.svg"}
                        alt={anime.title.romaji}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  </Link>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-1/3" />
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{anime.format}</div>
                  
                  <button
                    onClick={() => handleRemoveAnime(anime.id)}
                    disabled={isRemoving[anime.id]}
                    className="absolute top-2 left-2 bg-red-900/70 hover:bg-red-700/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove from list"
                  >
                    {isRemoving[anime.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="p-3">
                  <Link href={`/anime/${anime.id}`}>
                    <h3 className="font-medium text-sm line-clamp-2 h-10 group-hover:text-purple-400 transition-colors">
                      {anime.title.romaji}
                    </h3>
                  </Link>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-400">{anime.season} {anime.seasonYear}</p>
                    <span className="text-xs px-2 py-0.5 bg-purple-900/50 rounded-full">{anime.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && filteredList.length > 0 && (
          <div className="space-y-4">
            {filteredList.map((anime) => (
              <div key={anime.id} className="bg-gray-800/50 border border-gray-700 hover:border-purple-500 rounded-lg overflow-hidden flex transition-all duration-300">
                <div className="w-24 h-36 flex-shrink-0 relative group">
                  <Link href={`/anime/${anime.id}`}>
                    <img
                      src={anime.coverImage || "/placeholder.svg"}
                      alt={anime.title.romaji}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <button
                    onClick={() => handleRemoveAnime(anime.id)}
                    disabled={isRemoving[anime.id]}
                    className="absolute top-2 left-2 bg-red-900/70 hover:bg-red-700/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove from list"
                  >
                    {isRemoving[anime.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/anime/${anime.id}`}>
                        <h3 className="font-medium text-lg hover:text-purple-400 transition-colors">
                          {anime.title.romaji}
                        </h3>
                      </Link>
                      {anime.title.english && anime.title.english !== anime.title.romaji && (
                        <p className="text-gray-400 text-sm mb-2">{anime.title.english}</p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-purple-900/50 rounded-full">{anime.status}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-gray-700 rounded-full text-xs">{anime.format}</span>
                    {anime.episodes && (
                      <span className="px-2 py-1 bg-gray-700 rounded-full text-xs">{anime.episodes} eps</span>
                    )}
                    {anime.season && (
                      <span className="px-2 py-1 bg-gray-700 rounded-full text-xs">
                        {anime.season} {anime.seasonYear}
                      </span>
                    )}
                    {anime.studio && (
                      <span className="px-2 py-1 bg-gray-700 rounded-full text-xs">{anime.studio}</span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                    {anime.description?.replace(/<[^>]*>/g, '') || "No description available."}
                  </p>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Added on {new Date(anime.addedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}