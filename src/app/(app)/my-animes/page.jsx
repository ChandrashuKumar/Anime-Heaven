"use client"
import { useState, useEffect } from "react"
import { useAnime } from "@/store/AnimeContext"
import { useAuth } from "@/store/AuthContext"
import Link from "next/link"
import { Loader2, Search, ChevronLeft, ChevronRight, Calendar, Clock, Info, ChevronDown, ChevronUp } from "lucide-react"

export default function MyAnimeListPage() {
  const { user } = useAuth()
  const { animeList, loading, error, removeAnimeFromList } = useAnime()
  const [filteredList, setFilteredList] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [isRemoving, setIsRemoving] = useState({})
  const [backgroundImage, setBackgroundImage] = useState("/cherry-blossoms.jpg") // Default background
  const [expandedCards, setExpandedCards] = useState({})

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [totalPages, setTotalPages] = useState(1)
  const [displayedItems, setDisplayedItems] = useState([])

  // Apply filters
  useEffect(() => {
    if (!animeList) return

    let result = [...animeList]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (anime) =>
          anime.title.romaji.toLowerCase().includes(query) ||
          (anime.title.english && anime.title.english.toLowerCase().includes(query)),
      )
    }

    // Apply category filter
    if (activeFilter !== "all") {
      result = result.filter((anime) => anime.status === activeFilter)
    }

    // Sort by title
    result.sort((a, b) => a.title.romaji.localeCompare(b.title.romaji))

    setFilteredList(result)
    setTotalPages(Math.ceil(result.length / itemsPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }, [animeList, searchQuery, activeFilter, itemsPerPage])

  // Update displayed items when page changes
  useEffect(() => {
    if (filteredList.length === 0) {
      setDisplayedItems([])
      return
    }

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, filteredList.length)
    setDisplayedItems(filteredList.slice(startIndex, endIndex))
  }, [filteredList, currentPage, itemsPerPage])

  // Set a random anime cover as background if available
  useEffect(() => {
    if (animeList && animeList.length > 0) {
      const randomIndex = Math.floor(Math.random() * animeList.length)
      if (animeList[randomIndex].coverImage) {
        setBackgroundImage(animeList[randomIndex].coverImage)
      }
    }
  }, [animeList])

  const handleRemoveAnime = async (animeId) => {
    setIsRemoving((prev) => ({ ...prev, [animeId]: true }))
    try {
      await removeAnimeFromList(animeId)
    } catch (error) {
      console.error("Error removing anime:", error)
    } finally {
      setIsRemoving((prev) => ({ ...prev, [animeId]: false }))
    }
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const toggleCardExpansion = (animeId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [animeId]: !prev[animeId],
    }))
  }

  // Format date helper
  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.year) return "N/A"
    return `${dateObj.month}/${dateObj.day}/${dateObj.year}`
  }

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
    <div className="min-h-screen relative">
      {/* Background image with blur */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-fixed -z-10 top-0 left-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: "blur(5px)",
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero section */}
        <div className="h-32 sm:h-40 md:h-48 flex items-center justify-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg tracking-wider">
            MyAnimeList
          </h1>
        </div>

        {/* Content container - wider max width */}
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 flex-1 flex flex-col">
          {/* Filter tabs */}
          <div className="bg-gray-800 rounded-t-lg overflow-hidden">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base font-bold whitespace-nowrap ${
                  activeFilter === "all"
                    ? "text-purple-400 border-b-2 border-purple-400 bg-gray-700"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/30"
                }`}
              >
                All Anime
              </button>
              <button
                onClick={() => setActiveFilter("RELEASING")}
                className={`px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base font-bold whitespace-nowrap ${
                  activeFilter === "RELEASING"
                    ? "text-purple-400 border-b-2 border-purple-400 bg-gray-700"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/30"
                }`}
              >
                Currently Watching
              </button>
              <button
                onClick={() => setActiveFilter("FINISHED")}
                className={`px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base font-bold whitespace-nowrap ${
                  activeFilter === "FINISHED"
                    ? "text-purple-400 border-b-2 border-purple-400 bg-gray-700"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/30"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveFilter("NOT_YET_RELEASED")}
                className={`px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base font-bold whitespace-nowrap ${
                  activeFilter === "NOT_YET_RELEASED"
                    ? "text-purple-400 border-b-2 border-purple-400 bg-gray-700"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/30"
                }`}
              >
                Plan to Watch
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col backdrop-blur-sm">
            {/* Header with title and search */}
            <div className="bg-gray-800/80 p-2 sm:p-3 flex flex-col md:flex-row justify-between items-center border-t border-gray-700/50">
              <h2 className="text-sm sm:text-base font-semibold uppercase">
                {activeFilter === "all"
                  ? "ALL ANIME"
                  : activeFilter === "RELEASING"
                    ? "CURRENTLY WATCHING"
                    : activeFilter === "FINISHED"
                      ? "COMPLETED"
                      : "PLAN TO WATCH"}
              </h2>

              <div className="mt-2 md:mt-0 flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-md py-1 pl-7 pr-3 text-xs sm:text-sm w-full md:w-48 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                </div>

                <div className="ml-3 flex items-center">
                  <label htmlFor="items-per-page" className="text-xs sm:text-sm text-gray-300 mr-1">
                    Show:
                  </label>
                  <select
                    id="items-per-page"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Anime List */}
            <div className="bg-gray-900/80 rounded-b-lg overflow-hidden flex-1 p-2 sm:p-3">
              {/* Empty state */}
              {filteredList.length === 0 && (
                <div className="p-4 sm:p-6 text-center">
                  {searchQuery || activeFilter !== "all" ? (
                    <>
                      <p className="text-gray-300 mb-3 text-sm">No anime found matching your filters.</p>
                      <button
                        onClick={() => {
                          setSearchQuery("")
                          setActiveFilter("all")
                        }}
                        className="px-3 py-1 bg-purple-600 rounded-md hover:bg-purple-700 transition-colors text-sm"
                      >
                        Clear Filters
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-300 mb-3 text-sm">Your anime list is empty.</p>
                      <Link
                        href="/"
                        className="px-3 py-1 bg-purple-600 rounded-md hover:bg-purple-700 transition-colors text-sm"
                      >
                        Browse Anime
                      </Link>
                    </>
                  )}
                </div>
              )}

              {/* Anime Cards */}
              <div className="space-y-2">
                {displayedItems.map((anime) => (
                  <div
                    key={anime.id}
                    className="bg-gray-800/70 border border-gray-700 rounded-lg overflow-hidden hover:border-purple-500 transition-all duration-300"
                  >
                    {/* Mobile View */}
                    <div className="md:hidden">
                      <div className="flex">
                        {/* Left side - Image */}
                        <div className="w-20 sm:w-24 p-1.5 flex-shrink-0 bg-gray-800/50">
                          <div className="w-full aspect-[3/4] rounded overflow-hidden">
                            <img
                              src={anime.coverImage || "/placeholder.svg"}
                              alt={anime.title.romaji}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Right side - Basic Details */}
                        <div className="flex-1 p-2 flex flex-col justify-between">
                          <div>
                            <Link href={`/anime/${anime.id}`} className="hover:text-purple-400 transition-colors">
                              <h3 className="text-sm font-semibold line-clamp-1">{anime.title.romaji}</h3>
                            </Link>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="px-1.5 py-0.5 bg-gray-700/80 rounded text-xs">{anime.status}</span>
                              <span className="px-1.5 py-0.5 bg-gray-700/80 rounded text-xs">
                                {anime.episodes ? `${anime.episodes} eps` : "? eps"}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-1">
                            <button
                              onClick={() => toggleCardExpansion(anime.id)}
                              className="text-xs text-purple-400 flex items-center"
                            >
                              {expandedCards[anime.id] ? (
                                <>
                                  <ChevronUp size={12} className="mr-0.5" /> Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={12} className="mr-0.5" /> More
                                </>
                              )}
                            </button>

                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleRemoveAnime(anime.id)}
                                disabled={isRemoving[anime.id]}
                                className="px-1.5 py-0.5 bg-red-900/50 hover:bg-red-700 rounded text-xs transition-colors"
                              >
                                {isRemoving[anime.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : "Remove"}
                              </button>
                              <Link
                                href={`/anime/${anime.id}`}
                                className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                              >
                                Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded details for mobile */}
                      {expandedCards[anime.id] && (
                        <div className="p-2 pt-0 border-t border-gray-700/50 mt-1">
                          <div className="grid grid-cols-2 gap-x-2 text-xs">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-gray-400">Season:</span>
                            </div>
                            <div className="font-medium">
                              {anime.season && anime.seasonYear ? `${anime.season} ${anime.seasonYear}` : "N/A"}
                            </div>

                            <div className="flex items-center mt-1">
                              <Clock className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-gray-400">Duration:</span>
                            </div>
                            <div className="font-medium mt-1">{anime.duration ? `${anime.duration} min` : "N/A"}</div>

                            <div className="flex items-center mt-1">
                              <Info className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-gray-400">Studio:</span>
                            </div>
                            <div className="font-medium mt-1">{anime.studio || "N/A"}</div>
                          </div>

                          {anime.description && (
                            <div className="mt-2">
                              <p className="text-gray-400 text-xs mb-0.5">Synopsis</p>
                              <div
                                className="text-gray-300 line-clamp-2 text-xs"
                                dangerouslySetInnerHTML={{ __html: anime.description }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:flex md:flex-row">
                      {/* Left side - Image */}
                      <div className="md:w-40 p-2 flex flex-col bg-gray-800/50">
                        <div className="w-full aspect-[3/4] rounded overflow-hidden">
                          <img
                            src={anime.coverImage || "/placeholder.svg"}
                            alt={anime.title.romaji}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Right side - Details */}
                      <div className="flex-1 p-3 flex flex-col">
                        {/* Header with title and actions */}
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Link href={`/anime/${anime.id}`} className="hover:text-purple-400 transition-colors">
                              <h3 className="text-lg font-semibold">{anime.title.romaji}</h3>
                            </Link>
                            {anime.title.english && anime.title.english !== anime.title.romaji && (
                              <p className="text-gray-400 text-sm">{anime.title.english}</p>
                            )}
                          </div>

                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleRemoveAnime(anime.id)}
                              disabled={isRemoving[anime.id]}
                              className="px-2 py-0.5 bg-red-900/50 hover:bg-red-700 rounded text-sm transition-colors"
                            >
                              {isRemoving[anime.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : "Remove"}
                            </button>
                            <Link
                              href={`/anime/${anime.id}`}
                              className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                            >
                              Details
                            </Link>
                          </div>
                        </div>

                        {/* Using a table-like structure for perfect vertical alignment */}
                        <div className="grid grid-cols-3 gap-x-2">
                          {/* Row 1 - Labels */}
                          <div className="text-gray-400 text-sm">Status</div>
                          <div className="text-gray-400 text-sm">Episodes</div>
                          <div className="text-gray-400 text-sm">Added On</div>
                          {/* Row 1 - Values */}
                          <div className="font-medium text-sm">{anime.status}</div>
                          <div className="font-medium text-sm">{anime.episodes ? `0 / ${anime.episodes}` : "N/A"}</div>
                          <div className="font-medium text-sm">{new Date(anime.addedAt).toLocaleDateString()}</div>
                          {/* Row 2 - Labels with icons */}
                          <div className="flex items-center mt-2">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-gray-400 text-sm">Season</span>
                          </div>
                          <div className="flex items-center mt-2">
                            <Clock className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-gray-400 text-sm">Duration</span>
                          </div>
                          <div className="flex items-center mt-2">
                            <Info className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-gray-400 text-sm">Studio</span>
                          </div>
                          {/* Row 2 - Values */}
                          <div className="font-medium text-sm">
                            {anime.season && anime.seasonYear ? `${anime.season} ${anime.seasonYear}` : "N/A"}
                          </div>
                          <div className="font-medium text-sm">{anime.duration ? `${anime.duration} min` : "N/A"}</div>
                          <div className="font-medium text-sm">{anime.studio || "N/A"}</div>
                          {/* Row 3 - Labels */}
                          <div className="text-gray-400 text-sm mt-2">Start Date</div>
                          <div className="text-gray-400 text-sm mt-2">End Date</div>
                          <div className="text-gray-400 text-sm mt-2 opacity-0">Placeholder</div>
                          {/* Row 3 - Values */}
                          <div className="font-medium text-sm">{formatDate(anime.startDate)}</div>
                          <div className="font-medium text-sm">{formatDate(anime.endDate)}</div>
                          <div className="font-medium text-sm opacity-0">Placeholder</div>
                        </div>

                        {/* Synopsis - Separate section as before */}
                        {anime.description && (
                          <div className="mt-2">
                            <p className="text-gray-400 text-sm mb-0.5">Synopsis</p>
                            <div
                              className="text-gray-300 line-clamp-1 text-sm"
                              dangerouslySetInnerHTML={{ __html: anime.description }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {filteredList.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1 rounded-md bg-gray-800 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Logic to show pages around current page
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-6 sm:w-8 h-6 sm:h-8 rounded-md text-xs sm:text-sm ${
                              currentPage === pageNum
                                ? "bg-purple-600 text-white"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="flex items-center justify-center w-6 sm:w-8 h-6 sm:h-8 text-gray-400 text-xs sm:text-sm">
                            ...
                          </span>
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            className="w-6 sm:w-8 h-6 sm:h-8 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs sm:text-sm"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded-md bg-gray-800 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer space */}
          <div className="h-4 sm:h-6"></div>
        </div>
      </div>
    </div>
  )
}
