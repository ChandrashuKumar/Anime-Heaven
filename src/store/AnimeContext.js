"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/store/AuthContext";
import { db } from "@/firebase/config"
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  onSnapshot 
} from "firebase/firestore"

// Create the context
const AnimeContext = createContext()

export const AnimeProvider = ({ children }) => {
  const { user } = useAuth()
  const [animeList, setAnimeList] = useState([])
  const [animeIds, setAnimeIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Subscribe to the user's anime list in Firestore
  useEffect(() => {
    let unsubscribe = () => {}

    const subscribeToAnimeList = async () => {
      if (!user) {
        setAnimeList([])
        setAnimeIds([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const userAnimeListRef = doc(db, "animeLists", user.uid)
        
        // Check if document exists first
        const docSnap = await getDoc(userAnimeListRef)
        
        if (!docSnap.exists()) {
          // Create empty document if it doesn't exist
          await setDoc(userAnimeListRef, {
            userId: user.uid,
            animeIds: [],
            animes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
        
        // Subscribe to real-time updates
        unsubscribe = onSnapshot(userAnimeListRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data()
            setAnimeList(data.animes || [])
            setAnimeIds(data.animeIds || [])
          } else {
            setAnimeList([])
            setAnimeIds([])
          }
          setLoading(false)
        }, (err) => {
          console.error("Error subscribing to anime list:", err)
          setError(err)
          setLoading(false)
        })
      } catch (err) {
        console.error("Error setting up anime list subscription:", err)
        setError(err)
        setLoading(false)
      }
    }

    subscribeToAnimeList()

    // Cleanup subscription on unmount or when user changes
    return () => unsubscribe()
  }, [user])

  // Check if an anime is in the user's list
  const isInList = (animeId) => {
    return animeIds.includes(animeId)
  }

  // Add an anime to the user's list
  const addAnimeToList = async (anime) => {
    if (!user) return Promise.reject(new Error("User not logged in"))
    if (isInList(anime.id)) return Promise.resolve() // Already in list

    try {
      const userAnimeListRef = doc(db, "animeLists", user.uid)
      
      // Prepare the anime data with all required fields
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

      await updateDoc(userAnimeListRef, {
        animeIds: arrayUnion(anime.id),
        animes: arrayUnion(animeData),
        updatedAt: new Date().toISOString(),
      })

      return true
    } catch (error) {
      console.error("Error adding anime to list:", error)
      throw error
    }
  }

  // Remove an anime from the user's list
  const removeAnimeFromList = async (animeId) => {
    if (!user) return Promise.reject(new Error("User not logged in"))
    if (!isInList(animeId)) return Promise.resolve() // Not in list

    try {
      const userAnimeListRef = doc(db, "animeLists", user.uid)
      const docSnap = await getDoc(userAnimeListRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        const animeToRemove = data.animes.find((a) => a.id === animeId)

        if (animeToRemove) {
          await updateDoc(userAnimeListRef, {
            animeIds: arrayRemove(animeId),
            animes: arrayRemove(animeToRemove),
            updatedAt: new Date().toISOString(),
          })
        }
      }

      return true
    } catch (error) {
      console.error("Error removing anime from list:", error)
      throw error
    }
  }


  return (
    <AnimeContext.Provider
      value={{
        animeList,
        animeIds,
        loading,
        error,
        isInList,
        addAnimeToList,
        removeAnimeFromList,
      }}
    >
      {children}
    </AnimeContext.Provider>
  )
}

// Custom hook for accessing the AnimeContext
export const useAnime = () => useContext(AnimeContext)