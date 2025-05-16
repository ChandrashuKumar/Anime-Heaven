"use client"
import { useState, useEffect } from "react";
import { gql, useLazyQuery } from "@apollo/client";

const SEARCH_ANIME = gql`
  query SearchAnime($search: String!) {
    Page(perPage: 10) {
      media(search: $search, type: ANIME) {
        id
        title { romaji english }
        coverImage { medium }
        bannerImage
        episodes
        averageScore
      }
    }
  }
`;

export default function SearchBar() {
  const [input, setInput] = useState("");
  const [debounced, setDebounced] = useState(input);
  const [fetchAnime, { loading, data }] = useLazyQuery(SEARCH_ANIME, {
    variables: { search: debounced },
    fetchPolicy: "no-cache",
  });

  // Debounce input by 500ms
  useEffect(() => {
    const id = setTimeout(() => setDebounced(input), 500);  // delay
    return () => clearTimeout(id);
  }, [input]); 

  // Trigger query whenever debounced term changes and is at least 2 chars
  useEffect(() => {
    if (debounced.length > 1) fetchAnime();
  }, [debounced, fetchAnime]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <input
        type="search"
        placeholder="Search anime..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      {loading && <p>Loading…</p>}

      <ul className="space-y-4">
        {data?.Page?.media.map((m) => (
          <li key={m.id} className="flex items-center space-x-4">
            <img
              src={m.coverImage.medium}
              alt={m.title.romaji}
              className="w-16 h-24 object-cover rounded"
            />
            <div>
              <h3 className="text-lg font-semibold">
                {m.title.romaji} {m.title.english && `(${m.title.english})`}
              </h3>
              <p className="text-sm text-gray-600">
                {m.episodes} ep • Score: {m.averageScore}%
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
