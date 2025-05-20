"use client"
import { useState, useEffect } from "react"
import { usePathname } from 'next/navigation'
import { PlusCircle, CheckCircle, Loader2, X } from "lucide-react"
import { useAuth } from "@/store/AuthContext"
import Link from "next/link"
import { db } from "@/firebase/config"
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"

export default function AnimeListButton({ anime }) {
  const { user } = useAuth()
  const [isAdding, setIsAdding] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [isInList, setIsInList] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
   const pathname = usePathname()

  // Check if anime is in user's list when component mounts or user/anime changes
  useEffect(() => {
    const checkAnimeInList = async () => {
      if (!user) {
        setIsInList(false)
        setIsChecking(false)
        return
      }

      try {
        setIsChecking(true)
        const userAnimeListRef = doc(db, "animeLists", user.uid)
        const docSnap = await getDoc(userAnimeListRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setIsInList(data.animeIds?.includes(anime.id) || false)
        } else {
          setIsInList(false)
        }
      } catch (error) {
        console.error("Error checking anime list:", error)
      } finally {
        setIsChecking(false)
      }
    }

    checkAnimeInList()
  }, [user, anime.id])

  const addAnimeToList = async () => {
    if (!user) return

    setIsAdding(true)
    try {
      const userAnimeListRef = doc(db, "animeLists", user.uid)
      const docSnap = await getDoc(userAnimeListRef)

      // Prepare the anime data with all the requested fields
      const animeData = {
        id: anime.id,
        title: {
          romaji: anime.title.romaji,
          english: anime.title.english || null,
        },
        coverImage: anime.coverImage.large,
        status: anime.status,
        episodes: anime.episodes,
        season: anime.season,
        seasonYear: anime.seasonYear,
        duration: anime.duration,
        startDate: anime.startDate,
        endDate: anime.endDate,
        studio: anime.studios?.nodes?.[0]?.name || null,
        description: anime.description,
        addedAt: new Date().toISOString(),
      }

      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(userAnimeListRef, {
          animeIds: arrayUnion(anime.id),
          animes: arrayUnion(animeData),
          updatedAt: new Date().toISOString(),
        })
      } else {
        // Create new document
        await setDoc(userAnimeListRef, {
          userId: user.uid,
          animeIds: [anime.id],
          animes: [animeData],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }

      setIsInList(true)
    } catch (error) {
      console.error("Error adding anime to list:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const removeAnimeFromList = async () => {
    if (!user) return

    setIsRemoving(true)
    try {
      const userAnimeListRef = doc(db, "animeLists", user.uid)
      const docSnap = await getDoc(userAnimeListRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        const animeToRemove = data.animes.find((a) => a.id === anime.id)

        if (animeToRemove) {
          await updateDoc(userAnimeListRef, {
            animeIds: arrayRemove(anime.id),
            animes: arrayRemove(animeToRemove),
            updatedAt: new Date().toISOString(),
          })
        }
      }

      setIsInList(false)
    } catch (error) {
      console.error("Error removing anime from list:", error)
    } finally {
      setIsRemoving(false)
    }
  }

  if (!user) {
    return (
      <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
        <p className="text-gray-300 text-sm mb-2">Want to create your own anime list?</p>
        <Link
          href={`/sign-in?returnUrl=${encodeURIComponent(pathname)}`}
          className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white text-sm font-medium transition-colors"
        >
          Log in now
        </Link>
      </div>
    )
  }

  if (isChecking) {
    return (
      <div className="mt-4">
        <button
          className="flex items-center px-4 py-2 bg-gray-800 rounded-md text-gray-300 text-sm font-medium"
          disabled
        >
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Checking...
        </button>
      </div>
    )
  }

  return (
    <div className="mt-4">
      {isInList ? (
        <div className="flex space-x-2">
          <button
            className="flex items-center px-4 py-2 bg-purple-900/30 border border-purple-500 rounded-md text-purple-300 text-sm font-medium"
            disabled
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            In Your Anime List
          </button>
          <button
            onClick={removeAnimeFromList}
            disabled={isRemoving}
            className="flex items-center px-3 py-2 bg-red-900/30 border border-red-500 rounded-md text-red-300 text-sm font-medium hover:bg-red-900/50 transition-colors"
          >
            {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <button
          onClick={addAnimeToList}
          disabled={isAdding}
          className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white text-sm font-medium transition-colors"
        >
          {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
          Add to My Anime List
        </button>
      )}
    </div>
  )
}
