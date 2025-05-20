"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/store/AuthContext"
import { db, storage } from "@/firebase/config"
import { collection, addDoc, getDocs, query, where, serverTimestamp, deleteDoc, doc } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import Link from "next/link"
import { Loader2, Upload, X, ImageIcon, Trash2, ExternalLink } from "lucide-react"

export default function GalleryPage() {
  const { user } = useAuth()
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState({})

  // Fetch user's images on component mount
  useEffect(() => {
    if (user) {
      fetchUserImages()
    } else {
      setLoading(false)
    }
  }, [user])

  // Create a preview when a file is selected
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)

    // Free memory when this component unmounts
    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  // Fetch user's images from Firestore
  const fetchUserImages = async () => {
    try {
      setLoading(true)

      // Simple query without ordering to avoid index issues during development
      // In production, create the index and uncomment the orderBy
      const imagesQuery = query(
        collection(db, "userImages"),
        where("userId", "==", user.uid),
        // orderBy("createdAt", "desc")
      )

      const querySnapshot = await getDocs(imagesQuery)
      const imagesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Sort client-side as a fallback
      imagesList.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        return b.createdAt.seconds - a.createdAt.seconds
      })

      setImages(imagesList)
    } catch (err) {
      console.error("Error fetching images:", err)
      setError("Failed to load images. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Handle file selection
  const handleFileChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null)
      return
    }

    const file = e.target.files[0]

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, etc.)")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    setSelectedFile(file)
    setError(null)
  }

  // Clear selected file
  const handleClearFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in to upload images")
      return
    }

    if (!selectedFile) {
      setError("Please select an image to upload")
      return
    }

    try {
      setUploading(true)
      setError(null)

      // Create a unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${selectedFile.name}`
      const storageRef = ref(storage, `user-images/${user.uid}/${filename}`)

      // Upload file to Firebase Storage with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, selectedFile)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          // Handle upload errors
          console.error("Upload error:", error)
          setError("Failed to upload image. Please try again.")
          setUploading(false)
        },
        async () => {
          // Upload completed successfully
          try {
            // Get the download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

            // Save reference in Firestore
            await addDoc(collection(db, "userImages"), {
              userId: user.uid,
              imageUrl: downloadURL,
              storagePath: `user-images/${user.uid}/${filename}`,
              createdAt: serverTimestamp(),
              fileType: selectedFile.type,
              fileName: selectedFile.name,
              fileSize: selectedFile.size,
            })

            // Reset form
            setSelectedFile(null)
            setPreviewUrl(null)
            setUploadProgress(0)

            // Refresh the image list
            await fetchUserImages()
          } catch (err) {
            console.error("Error saving image data:", err)
            setError(`Failed to save image data: ${err.message}`)
          } finally {
            setUploading(false)
          }
        },
      )
    } catch (err) {
      console.error("Upload error:", err)
      setError("An unexpected error occurred. Please try again.")
      setUploading(false)
    }
  }

  // Delete an image
  const handleDeleteImage = async (imageId, storagePath) => {
    if (!user) return

    try {
      setDeleting((prev) => ({ ...prev, [imageId]: true }))

      // Delete from Firebase Storage
      if (storagePath) {
        const storageRef = ref(storage, storagePath)
        await deleteObject(storageRef)
      }

      // Delete from Firestore
      await deleteDoc(doc(db, "userImages", imageId))

      // Update the UI
      setImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (error) {
      console.error("Error deleting image:", error)
      setError("Failed to delete image. Please try again.")
    } finally {
      setDeleting((prev) => ({ ...prev, [imageId]: false }))
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">My Gallery</h1>
        <p className="text-gray-400 mb-4">Please log in to view and upload images.</p>
        <Link href="/sign-in" className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
          Log In
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Background with blur - using a placeholder */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-fixed -z-10 top-0 left-0"
        style={{
          backgroundImage: `url(/placeholder.svg?height=1080&width=1920&query=anime%20cherry%20blossoms%20background)`,
          filter: "blur(5px)",
        }}
      ></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero section */}
        <div className="h-48 md:h-64 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg tracking-wider">My Gallery</h1>
        </div>

        {/* Content container */}
        <div className="w-full max-w-7xl mx-auto px-4 flex-1 flex flex-col">
          {/* Upload section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Upload New Image</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Image File</label>
                    <div className="flex items-center">
                      <label className="flex-1">
                        <div className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white cursor-pointer hover:bg-gray-600 transition-colors flex items-center justify-center">
                          <Upload className="h-4 w-4 mr-2" />
                          <span>{selectedFile ? selectedFile.name : "Choose file..."}</span>
                        </div>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                      {selectedFile && (
                        <button
                          type="button"
                          onClick={handleClearFile}
                          className="ml-2 p-2 bg-red-900/50 hover:bg-red-700 rounded-md"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-400 text-sm p-2 bg-red-900/20 border border-red-900/30 rounded-md">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading ({Math.round(uploadProgress)}%)
                      </>
                    ) : (
                      "Upload Image"
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="max-h-64 max-w-full rounded-md object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-64 w-full flex items-center justify-center bg-gray-700 rounded-md border border-dashed border-gray-600">
                      <div className="text-center text-gray-400">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                        <p>Image preview will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Gallery section */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg overflow-hidden flex-1">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">My Images</h2>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-400">You haven't uploaded any images yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="bg-gray-700 rounded-lg overflow-hidden border border-gray-600 hover:border-purple-500 transition-all duration-300 group"
                    >
                      <div className="aspect-square relative">
                        <img
                          src={image.imageUrl || "/placeholder.svg"}
                          alt={image.fileName || "Uploaded image"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <a
                            href={image.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                          <button
                            onClick={() => handleDeleteImage(image.id, image.storagePath)}
                            disabled={deleting[image.id]}
                            className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                          >
                            {deleting[image.id] ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-gray-400 text-xs truncate" title={image.fileName}>
                          {image.fileName || "Unnamed image"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {image.createdAt
                            ? new Date(image.createdAt.seconds * 1000).toLocaleDateString()
                            : "Unknown date"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer space */}
          <div className="h-6"></div>
        </div>
      </div>
    </div>
  )
}
