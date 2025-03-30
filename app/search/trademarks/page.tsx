"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FilterSidebar from "@/components/Filter";
import Navbar from "@/components/Navbar";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchCountry, setSearchCountry] = useState(searchParams.get("country") || "us");
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    setSearchCountry(searchParams.get("country") || "us");
    setCurrentPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

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
      setError("Failed to fetch search results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateSearchParams = () => {
    router.push(
      `/search/trademarks?q=${encodeURIComponent(searchQuery)}&country=${searchCountry}&page=${currentPage}`
    );
  };

  useEffect(() => {
    updateSearchParams();
  }, [searchQuery, searchCountry, currentPage]);

  return (
    <div>
      <Navbar 
        query={searchQuery} 
        page={currentPage} 
        country={searchCountry} 
        initialResults={searchResults} 
        initialError={error} 
      />

      {/* {/* <FilterSidebar data={searchResults} />
      {loading ? <p>Loading...</p> : <p>Results here...</p>} */}
     </div> 
  );
};

export default SearchPage;
