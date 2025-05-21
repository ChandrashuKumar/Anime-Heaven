export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#ADA8B6] flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-t-transparent border-[#23022E]/30 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent border-[#ADA8B6] animate-spin"></div>
        </div>
      </div>
      <p className="mt-4 text-[#23022E]/70 text-sm sm:text-base">Loading...</p>
    </div>
  )
}
