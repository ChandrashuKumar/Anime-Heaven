"use client"

import { useState, useEffect, useRef } from "react";
import { gql, useLazyQuery } from "@apollo/client";

// AniList GraphQL query
const SEARCH_ANIME = gql`
  query SearchAnime($search: String!) {
    Page(perPage: 10) {
      media(search: $search, type: ANIME) {
        id
        title { romaji english }
        coverImage { medium }
        format
        episodes
        averageScore
        seasonYear
        status
      }
    }
  }
`;

// Custom styles with the exact hover effects
const customStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 5px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #111;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 5px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #444;
  }

  .results-container {
    overflow-x: hidden;
  }

  .search-result-item {
    transition: background-color 0.2s ease, border 0.2s ease;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
  }

  .search-result-item:hover {
    background-color: #141414;
    border: 1px solid #6366f1;
    border-radius: 6px;
  }

  .search-result-item.selected {
    background-color: #141414;
    border: 1px solid #6366f1;
    border-radius: 6px;
  }

  .item-content {
    display: flex;
    align-items: center;
    transition: transform 0.2s ease;
  }

  .search-result-item:hover .item-content {
    transform: translateX(8px);
  }

  .search-result-item.selected .item-content {
    transform: translateX(8px);
  }

  .meta-text {
    transition: color 0.2s ease;
  }

  .search-result-item:hover .meta-text {
    color: #6366f1;
  }

  .search-result-item.selected .meta-text {
    color: #6366f1;
  }
`;

export default function SearchBar() {
  const [input, setInput] = useState("");
  const [debounced, setDebounced] = useState(input);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  
  const [fetchAnime, { loading, data }] = useLazyQuery(SEARCH_ANIME, {
    variables: { search: debounced },
    fetchPolicy: "no-cache",
  });

  const searchResults = data?.Page?.media || [];

  // Debounce input by 500ms
  useEffect(() => {
    const id = setTimeout(() => setDebounced(input), 500);  // delay
    return () => clearTimeout(id);
  }, [input]); 

  // Trigger query whenever debounced term changes and is at least 2 chars
  useEffect(() => {
    if (debounced.length > 1) {
      fetchAnime();
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [debounced, fetchAnime]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, []);

  // Scroll selected item into view when using keyboard navigation
  useEffect(() => {
    if (resultsRef.current && searchResults.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, searchResults.length]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isDropdownOpen || searchResults.length === 0) return;

    // Arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
    }
    // Arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }
    // Enter to select
    else if (e.key === "Enter") {
      e.preventDefault();
      handleSelectAnime(searchResults[selectedIndex]);
    }
    // Escape to close
    else if (e.key === "Escape") {
      e.preventDefault();
      setIsDropdownOpen(false);
    }
  };

  // Handle anime selection
  const handleSelectAnime = (anime) => {
    console.log("Selected anime:", anime.title.romaji);
    setIsDropdownOpen(false);
    // Here you would typically navigate to the anime page
  };

  // Clear search
  const clearSearch = () => {
    setInput("");
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  // Format anime type for display
  const formatType = (format) => {
    if (!format) return "UNKNOWN";
    return format.replace(/_/g, " ");
  };

  return (
    <>
      {/* Add the custom styles */}
      <style jsx global>{customStyles}</style>
      
      <div className="relative w-full max-w-md" ref={searchRef}>
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder="Search Anime"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-md py-2 pl-10 pr-10 text-sm text-white focus:outline-none"
            onFocus={() => {
              if (input.length > 1) setIsDropdownOpen(true);
            }}
          />

          {input && (
            <button 
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white" 
              onClick={clearSearch}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Loading indicator */}
        {loading && isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-[#111] border border-zinc-800 rounded-md shadow-lg p-4 text-center">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              <span className="ml-2 text-gray-400">Searching...</span>
            </div>
          </div>
        )}

        {/* Dropdown search results with custom scrollbar */}
        {isDropdownOpen && !loading && searchResults.length > 0 && (
          <div 
            ref={resultsRef}
            className="absolute z-50 w-full mt-1 bg-[#111] border border-zinc-800 rounded-md shadow-lg max-h-[400px] overflow-y-auto overflow-x-hidden custom-scrollbar results-container"
          >
            {searchResults.map((anime, index) => (
              <div
                key={anime.id}
                className={`p-3 cursor-pointer search-result-item ${
                  index === selectedIndex ? 'selected' : ''
                }`}
                onClick={() => handleSelectAnime(anime)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {/* Wrap all content in a div that will shift right */}
                <div className="item-content">
                  <div className="flex-shrink-0 w-[50px] h-[50px] relative overflow-hidden rounded">
                    <img 
                      src={anime.coverImage.medium || "/placeholder.svg"} 
                      alt={anime.title.romaji}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-white">{anime.title.romaji}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-[#222] text-gray-400 text-xs px-2 py-0.5 rounded-full meta-text">{anime.seasonYear || "?"}</span>
                      <span className="bg-[#222] text-gray-400 text-xs px-2 py-0.5 rounded-full meta-text">
                        {formatType(anime.format)}
                      </span>

                      <div className="flex items-center text-gray-400 meta-text">
                        <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 6H22M2 12H22M2 18H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="text-xs">{anime.episodes || "?"}</span>
                      </div>

                      <div className="flex items-center text-gray-400 meta-text">
                        <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                            stroke="currentColor"
                            fill="none"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-xs">{anime.averageScore || "?"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isDropdownOpen && !loading && input.length > 1 && searchResults.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-[#111] border border-zinc-800 rounded-md shadow-lg p-4 text-center">
            <p className="text-gray-400">No results found for "{input}"</p>
          </div>
        )}
      </div>
    </>
  );
}