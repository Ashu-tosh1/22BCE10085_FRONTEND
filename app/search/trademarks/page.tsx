"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Set initial state safely
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "nike");
  const [searchCountry, setSearchCountry] = useState(() => searchParams.get("country") || "us");
  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get("page")) || 1);

  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ensure state updates when searchParams change
  useEffect(() => {
    const q = searchParams.get("q") || "nike"; // Ensure default
    const country = searchParams.get("country") || "us";
    const page = Number(searchParams.get("page")) || 1;

    setSearchQuery(q);
    setSearchCountry(country);
    setCurrentPage(page);
  }, [searchParams.toString()]); // 🔹 Ensure reactivity when URL changes

  // Fetch results when relevant state changes
  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults();
    }
  }, [searchQuery, searchCountry, currentPage]);

  const fetchSearchResults = async () => {
    setLoading(true);
    setError(null);

    const requestBody = {
      input_query: searchQuery,
      sort_by: "default",
      status: [],
      exact_match: false,
      owners: [],
      attorneys: [],
      law_firms: [],
      page: currentPage,
      rows: 10,
      sort_order: "desc",
      states: [],
      counties: [],
    };

    try {
      const response = await fetch(`https://vit-tm-task.api.trademarkia.app/api/v3/${searchCountry}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update the URL when state changes
  useEffect(() => {
    const newUrl = `/search/trademarks?q=${encodeURIComponent(searchQuery)}&country=${searchCountry}&page=${currentPage}`;
    
    // Only push if the URL is actually different
    if (window.location.href !== newUrl) {
      router.push(newUrl);
    }
  }, [searchQuery, searchCountry, currentPage]);

  return (
    <div key={searchParams.toString()}> {/* 🔹 Force re-mounting when URL changes */}
      <Navbar 
        query={searchQuery} 
        page={currentPage} 
        country={searchCountry} 
        initialResults={searchResults} 
        initialError={error} 
      />
    </div> 
  );
};

export default SearchPage;
