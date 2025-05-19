"use client"
import { gql, useQuery } from "@apollo/client"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect } from "react"
import AnimeCard from "@/components/AnimeCard"
import CharacterCard from "@/components/CharacterCard"
import AnimeListButton from "@/components/AnimeListButton"

// Updated GraphQL query to request larger images
const GET_ANIME_DETAILS = gql`
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      description(asHtml: true)
      coverImage {
        large
        extraLarge
      }
      bannerImage
      season
      seasonYear
      format
      episodes
      duration
      status
      genres
      averageScore
      popularity
      studios(isMain: true) {
        nodes {
          id
          name
        }
      }
      characters(sort: ROLE, perPage: 6) {
        edges {
          node {
            id
            name {
              full
            }
            image {
              medium
              large
            }
          }
          role
        }
      }
      recommendations(perPage: 5) {
        nodes {
          mediaRecommendation {
            id
            title {
              romaji
            }
            coverImage {
              medium
              large
              extraLarge
            }
            seasonYear
            format
            averageScore
          }
        }
      }
      tags {
        id
        name
        rank
      }
      externalLinks {
        id
        url
        site
      }
      trailer {
        id
        site
        thumbnail
      }
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
    }
  }
`

export default function AnimeDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const animeId = Number.parseInt(params.id, 10)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [animeId])

  const { loading, error, data } = useQuery(GET_ANIME_DETAILS, {
    variables: { id: animeId },
    fetchPolicy: "network-only",
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error Loading Anime</h1>
        <p className="text-gray-400 mb-4">{error.message}</p>
        <Link href="/" className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
          Return Home
        </Link>
      </div>
    )
  }

  const anime = data?.Media
  if (!anime) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Anime Not Found</h1>
        <Link href="/" className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
          Return Home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Banner Image */}
      {anime.bannerImage && (
        <div className="relative w-full h-64 md:h-80">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10"></div>
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${anime.bannerImage})` }}
          ></div>
        </div>
      )}

      <div className="container max-w-7xl mx-auto px-4 py-6 -mt-32 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover Image */}
          <div className="flex-shrink-0">
            <div className="w-48 h-72 rounded-lg overflow-hidden shadow-lg">
              <img
                src={anime.coverImage.extraLarge || anime.coverImage.large || "/placeholder.svg"}
                alt={anime.title.romaji}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Add to Anime List Button - Now handles all the logic internally */}
            <AnimeListButton anime={anime} />
          </div>

          {/* Anime Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{anime.title.romaji}</h1>
            {anime.title.english && anime.title.english !== anime.title.romaji && (
              <h2 className="text-xl text-gray-300 mb-4">{anime.title.english}</h2>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genres.map((genre) => (
                <span key={genre} className="px-3 py-1 bg-gray-800 rounded-full text-xs">
                  {genre}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Format</p>
                <p>{anime.format}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p>{anime.status}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Episodes</p>
                <p>{anime.episodes || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Score</p>
                <p>{anime.averageScore ? `${anime.averageScore}%` : "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Season</p>
                <p>{anime.season ? `${anime.season} ${anime.seasonYear}` : "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Duration</p>
                <p>{anime.duration ? `${anime.duration} min` : "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Start Date</p>
                <p>
                  {anime.startDate.year
                    ? `${anime.startDate.month}/${anime.startDate.day}/${anime.startDate.year}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">End Date</p>
                <p>
                  {anime.endDate.year ? `${anime.endDate.month}/${anime.endDate.day}/${anime.endDate.year}` : "TBA"}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Synopsis</h3>
              <div
                dangerouslySetInnerHTML={{ __html: anime.description }}
                className="text-gray-300 line-clamp-4 md:line-clamp-none"
              />
            </div>

            {anime.studios.nodes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Studios</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.studios.nodes.map((studio) => (
                    <span key={studio.id} className="px-3 py-1 bg-purple-900/50 rounded-full text-sm">
                      {studio.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {anime.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {[...anime.tags]
                    .sort((a, b) => b.rank - a.rank)
                    .slice(0, 10)
                    .map((tag) => (
                      <span key={tag.id} className="px-3 py-1 bg-gray-800 rounded-full text-xs flex items-center">
                        {tag.name}
                        {tag.rank > 75 && (
                          <span className="ml-1 bg-purple-500 rounded-full w-2 h-2" title={`Rank: ${tag.rank}%`}></span>
                        )}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {anime.externalLinks.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">External Links</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.externalLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-xs transition-colors"
                    >
                      {link.site}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {anime.trailer && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Trailer</h3>
                <div className="aspect-video max-w-2xl rounded-lg overflow-hidden bg-black">
                  {anime.trailer.site === "youtube" ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${anime.trailer.id}`}
                      title={`${anime.title.romaji} Trailer`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p>Trailer not available</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Characters Section */}
        {anime.characters.edges.length > 0 && (
          <div className="mt-10">
            <h3 className="text-2xl font-bold mb-4">Characters</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {anime.characters.edges.map((edge) => {
                const character = {
                  id: edge.node.id,
                  name: edge.node.name.full,
                  image: edge.node.image.large || edge.node.image.medium,
                  role: edge.role,
                }

                return <CharacterCard key={character.id} character={character} />
              })}
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {anime.recommendations.nodes.length > 0 && (
          <div className="mt-20 mb-10">
            <h3 className="text-2xl font-bold mb-4">You Might Also Like</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {anime.recommendations.nodes.map((rec) => {
                const recommendedAnime = {
                  id: rec.mediaRecommendation.id,
                  title: rec.mediaRecommendation.title.romaji,
                  image: rec.mediaRecommendation.coverImage.large || rec.mediaRecommendation.coverImage.medium,
                  year: rec.mediaRecommendation.seasonYear,
                  type: rec.mediaRecommendation.format,
                  score: rec.mediaRecommendation.averageScore,
                }

                return (
                  <Link href={`/anime/${rec.mediaRecommendation.id}`} key={rec.mediaRecommendation.id}>
                    <AnimeCard anime={recommendedAnime} />
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
