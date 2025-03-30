"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

// Define correct types
interface TrademarkHit {
  _id: string;
  _source: {
    mark_identification: string;
    current_owner: string;
    registration_number: string;
    registration_date?: number;
    renewal_date?: number;
    status_type: string;
    mark_description_description?: string[];
    class_codes?: string[];
  };
}

interface TrademarkData {
  hits?: {
    total?: { value: number };
    hits: TrademarkHit[];
  };
}

interface SearchResult {
  body: TrademarkData; // ✅ FIXED: Now matches API response
  total_pages?: number;
}

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Define state with correct types
  const [searchQuery, setSearchQuery] = useState<string>(() => searchParams.get("q") || "nike");
  const [searchCountry, setSearchCountry] = useState<string>(() => searchParams.get("country") || "us");
  const [currentPage, setCurrentPage] = useState<number>(() => Number(searchParams.get("page")) || 1);

  const [searchResults, setSearchResults] = useState<SearchResult | null>(); 
  const [, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when search parameters change
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "nike");
    setSearchCountry(searchParams.get("country") || "us");
    setCurrentPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  // Fetch results when state changes
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
  
      const data: TrademarkData = await response.json(); 
  
      // 🔹 Ensure `hits.length` is explicitly defined
      const updatedHits = data.hits ? { ...data.hits, length: data.hits.hits.length || 0 } : { hits: [], length: 0 };
  
      setSearchResults({
        body: { ...data, hits: updatedHits },  // ✅ Force `length` property
        total_pages: data.hits?.total?.value || 0,
      });
  
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };
  

  // Update URL on state change
  useEffect(() => {
    const newUrl = `/search/trademarks?q=${encodeURIComponent(searchQuery)}&country=${searchCountry}&page=${currentPage}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      router.push(newUrl);
    }
  }, [searchQuery, searchCountry, currentPage, router]);

  return (
    <div key={searchParams.toString()}>
      <Navbar
        query={searchQuery}
        page={currentPage}
        country={searchCountry}
        initialResults={searchResults} // 
        initialError={error}
      />
    </div>
  );
};

export default SearchPage;
