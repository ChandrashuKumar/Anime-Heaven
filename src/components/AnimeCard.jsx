import Image from "next/image"
import { Star } from "lucide-react"


export default function AnimeCard({ anime }) {
  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group">
      <div className="relative aspect-[3/4] md:aspect-[11/12] overflow-hidden">
        <Image
          src={anime.image || "/placeholder.svg"}
          alt={anime.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-1/3" />
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{anime.type}</div>
        <div className="absolute bottom-2 left-2 flex items-center text-white text-xs">
          <Star className="h-3 w-3 text-yellow-400 mr-1 fill-yellow-400" />
          {anime.score}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 h-10">{anime.title}</h3>
        <p className="text-xs text-gray-400 mt-1">{anime.year}</p>
      </div>
    </div>
  )
}
