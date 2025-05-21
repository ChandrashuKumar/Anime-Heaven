"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/store/AuthContext"
import { db, storage } from "@/firebase/config"
import { collection, addDoc, getDocs, query, where, serverTimestamp, deleteDoc, doc } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import Link from "next/link"
import { Loader2, Upload, X, ImageIcon, Trash2, XCircle, Download } from "lucide-react"

// Add custom styles to head
import Head from "next/head"

export default function GalleryPage() {
  const { user } = useAuth()
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  // Add these new state variables after the existing state declarations (around line 21)
  const [currentPage, setCurrentPage] = useState(1)
  const [imagesPerPage, setImagesPerPage] = useState(50)
  const [totalPages, setTotalPages] = useState(1)
  const [displayedImages, setDisplayedImages] = useState([])

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

  // Handle escape key to close modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setSelectedImage(null)
      }
    }
    window.addEventListener("keydown", handleEsc)

    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [])

  // Add this useEffect after the existing useEffects (around line 80)
  // Update displayed images when page changes or images are loaded/filtered
  useEffect(() => {
    if (images.length === 0) {
      setDisplayedImages([])
      setTotalPages(1)
      return
    }

    // Calculate total pages
    const calculatedTotalPages = Math.ceil(images.length / imagesPerPage)
    setTotalPages(calculatedTotalPages)

    // If current page is out of bounds after deletion, adjust it
    if (currentPage > calculatedTotalPages) {
      setCurrentPage(calculatedTotalPages)
      return
    }

    // Slice the images array to get current page items
    const startIndex = (currentPage - 1) * imagesPerPage
    const endIndex = Math.min(startIndex + imagesPerPage, images.length)
    setDisplayedImages(images.slice(startIndex, endIndex))
  }, [images, currentPage, imagesPerPage])

  // Fetch user's images from Firestore
  const fetchUserImages = async () => {
    try {
      setLoading(true)

      const imagesQuery = query(collection(db, "userImages"), where("userId", "==", user.uid))

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
            setShowUploadForm(false)

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
      setDeleting(true)

      // Delete from Firebase Storage
      if (storagePath) {
        try {
          const storageRef = ref(storage, storagePath)
          await deleteObject(storageRef)
        } catch (storageError) {
          console.error("Error deleting from storage:", storageError)
          // Continue with Firestore deletion even if Storage deletion fails
        }
      }

      // Delete from Firestore
      await deleteDoc(doc(db, "userImages", imageId))

      // Update the UI
      setImages((prev) => prev.filter((img) => img.id !== imageId))
      setSelectedImage(null)
    } catch (error) {
      console.error("Error deleting image:", error)
      setError("Failed to delete image. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size"
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date"
    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
  }

  // Add this function before the return statement (around line 250)
  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    // Scroll to top of gallery with smooth animation
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#ada8b6] text-[#23022e] flex flex-col items-center justify-center p-4">
        <div className="bg-[#ADA8B6] p-8 rounded-2xl shadow-xl border border-[#23022E] max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6 text-center text-[#23022e]">My Gallery</h1>
          <p className="text-[#23022e]/80 mb-8 text-center">Please log in to view and upload your images.</p>
          <Link
            href="/sign-in"
            className="w-full block text-center px-6 py-3 bg-[#23022e] text-[#eff8e2] rounded-xl hover:bg-[#23022e]/90 transition-all duration-300 shadow-lg hover:shadow-[#23022e]/25 font-medium"
          >
            Log In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-[#ADA8B6]">
      <Head>
        <style jsx global>{`
          @media (min-width: 475px) {
            .xs\\:columns-2 {
              columns: 2;
            }
            .xs\\:inline {
              display: inline;
            }
          }
        `}</style>
      </Head>
      {/* Background pattern */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-fixed opacity-10 -z-10"
        style={{
          backgroundImage: `url(/placeholder.svg?height=1080&width=1920&query=subtle%20geometric%20pattern)`,
        }}
      ></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero section */}
        <div className="py-6 sm:py-8 md:py-12 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 sm:w-64 h-40 sm:h-64 bg-[#23022e]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-32 sm:w-48 h-32 sm:h-48 bg-[#23022e]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-36 sm:w-56 h-36 sm:h-56 bg-[#ADA8B6]/30 rounded-full blur-3xl"></div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#23022e] drop-shadow-sm tracking-wider relative z-10 mb-1 sm:mb-2 text-center">
            My Gallery
          </h1>
          <p className="text-[#23022e]/80 text-base sm:text-lg text-center">Your personal collection of memories</p>
        </div>

        {/* Content container */}
        <div className="w-full max-w-7xl mx-auto px-4 flex-1 flex flex-col">
          {/* Upload button/section */}
          <div className="mb-8 flex justify-end">
            {!showUploadForm ? (
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-[#23022e] hover:bg-[#23022e]/90 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-[#23022e]/40 flex items-center font-medium text-sm sm:text-base"
              >
                <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Upload</span> Image
              </button>
            ) : (
              <div className="w-full bg-[#ADA8B6] rounded-xl p-3 sm:p-6 shadow-lg border border-[#23022E]">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-[#23022e]">Upload New Image</h2>
                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="text-[#23022e]/70 hover:text-[#23022e] bg-[#ADA8B6]/50 hover:bg-[#ADA8B6]/70 rounded-full p-1.5 sm:p-2 z-10"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <div className="flex-1">
                      <label className="flex-1">
                        <div className="bg-white border border-[#23022E]/30 rounded-xl py-2 sm:py-3 px-3 sm:px-4 text-[#23022e] cursor-pointer transition-all duration-300 flex items-center justify-center group">
                          <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-[#23022e]/70 group-hover:text-[#23022e] transition-colors" />
                          <span className="truncate text-sm sm:text-base">
                            {selectedFile ? selectedFile.name : "Choose file..."}
                          </span>
                        </div>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={uploading || !selectedFile}
                      className="bg-[#23022e] hover:bg-[#23022e]/90 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:bg-[#ada8b6] flex items-center justify-center whitespace-nowrap font-medium text-sm sm:text-base"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 animate-spin" />
                          {Math.round(uploadProgress)}%
                        </>
                      ) : (
                        "Upload"
                      )}
                    </button>
                  </div>

                  {previewUrl && (
                    <div className="flex items-center gap-3 bg-[#ADA8B6] p-3 rounded-xl border border-[#23022E]">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-lg border border-[#cecfc7]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[#23022e] truncate">{selectedFile?.name}</p>
                        <p className="text-[#23022e]/70 text-sm">{formatFileSize(selectedFile?.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="p-2 bg-[#23022e]/10 hover:bg-[#23022e]/20 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4 text-[#23022e]" />
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="text-red-700 text-sm p-3 bg-red-100 border border-red-200 rounded-xl flex items-center">
                      <div className="bg-red-200 p-1 rounded-full mr-2">
                        <X className="h-4 w-4 text-red-600" />
                      </div>
                      {error}
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>

          {/* Gallery section */}
          <div className="flex-1 mb-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20 bg-[#ADA8B6] rounded-xl border border-[#23022E] shadow-md">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-3 sm:border-4 border-t-transparent border-[#23022e]/30 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-3 sm:border-4 border-t-transparent border-[#ada8b6] animate-spin"></div>
                  </div>
                </div>
                <p className="mt-3 sm:mt-4 text-[#23022e]/70 text-sm sm:text-base">Loading your gallery...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12 sm:py-20 bg-[#ADA8B6] rounded-xl border border-[#23022E] shadow-md px-4">
                <div className="bg-[#ADA8B6] w-16 sm:w-20 h-16 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-[#23022E]">
                  <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-[#23022e]/60" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#23022e] mb-1 sm:mb-2">Your gallery is empty</h3>
                <p className="text-[#23022e]/70 mb-4 sm:mb-6 text-sm sm:text-base">
                  Upload your first image to get started
                </p>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="bg-[#23022e] hover:bg-[#23022e]/90 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-all duration-300 shadow-md hover:shadow-[#23022e]/40 flex items-center font-medium mx-auto text-sm sm:text-base"
                >
                  <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Upload Image
                </button>
              </div>
            ) : (
              <div className="columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2 sm:gap-3 md:gap-4 space-y-2 sm:space-y-3 md:space-y-4">
                {displayedImages.map((image) => (
                  <div
                    key={image.id}
                    className="break-inside-avoid mb-2 sm:mb-3 md:mb-4"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="relative overflow-hidden rounded-lg sm:rounded-xl cursor-pointer group transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 shadow-md hover:shadow-[#23022e]/20 border border-[#23022E] bg-[#ADA8B6]">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#23022e]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <img
                        src={image.imageUrl || "/placeholder.svg"}
                        alt={image.fileName || "Uploaded image"}
                        className="w-full h-auto"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "/abstract-geometric-shapes.png"
                          e.target.alt = "Image not available"
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-xs sm:text-sm truncate font-medium">{image.fileName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 mb-2 flex justify-center items-center">
              <div className="flex items-center space-x-1 sm:space-x-2 bg-[#23022E]/10 p-1.5 sm:p-2 rounded-lg">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-md bg-[#23022E] text-white disabled:opacity-50 disabled:bg-[#23022E]/50"
                  aria-label="Previous page"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <div className="flex space-x-1 sm:space-x-2">
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
                        className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-md text-sm sm:text-base ${
                          currentPage === pageNum
                            ? "bg-[#ADA8B6] text-[#23022E] font-medium"
                            : "bg-[#23022E]/20 text-[#23022E] hover:bg-[#23022E]/30"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-[#23022E]">
                        ...
                      </span>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-md bg-[#23022E]/20 text-[#23022E] hover:bg-[#23022E]/30 text-sm sm:text-base"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-md bg-[#23022E] text-white disabled:opacity-50 disabled:bg-[#23022E]/50"
                  aria-label="Next page"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Image Preview Modal */}
          {selectedImage && (
            <div className="fixed inset-0 bg-[#23022e]/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
              <div className="relative max-w-5xl w-full max-h-[95vh] flex flex-col">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-10 sm:-top-12 right-0 text-[#ADA8B6] hover:text-white transition-colors bg-[#23022e]/50 hover:bg-[#23022e]/70 rounded-full p-1.5 sm:p-2 z-10"
                >
                  <XCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                </button>

                {/* Image displayed without container - optimized for touch */}
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedImage.imageUrl || "/placeholder.svg"}
                    alt="Image preview"
                    className="w-auto h-auto max-w-full max-h-[80vh] object-contain"
                    onError={(e) => {
                      e.target.src = "/abstract-geometric-shapes.png"
                      e.target.alt = "Image not available"
                    }}
                  />
                </div>

                {/* Action buttons floating at the bottom - more touch-friendly */}
                <div className="mt-3 sm:mt-4 flex justify-center space-x-3 sm:space-x-4 animate-slideUp">
                  <a
                    href={selectedImage.imageUrl}
                    download={selectedImage.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#ADA8B6] hover:bg-[#ADA8B6]/80 text-[#23022e] rounded-lg sm:rounded-xl transition-all duration-300 flex items-center shadow-md text-sm sm:text-base"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Download
                  </a>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteImage(selectedImage.id, selectedImage.storagePath)
                    }}
                    disabled={deleting}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg sm:rounded-xl transition-all duration-300 flex items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 text-sm sm:text-base"
                  >
                    {deleting ? (
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {/* <footer className="mt-auto py-4 sm:py-6 text-center text-[#23022e]/60 text-xs sm:text-sm border-t border-[#23022E]/20">
          <p>© {new Date().getFullYear()} My Anime Gallery • All rights reserved</p>
        </footer> */}
      </div>
    </div>
  )
}
