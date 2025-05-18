import Image from "next/image"
export default function CharacterCard({ character }) {
  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={character.image || "/placeholder.svg"}
          alt={character.name}
          fill
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-1/3" />
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-1">{character.name}</h3>
        <p className="text-xs text-gray-400 mt-1">{character.role}</p>
      </div>
    </div>
  )
}
