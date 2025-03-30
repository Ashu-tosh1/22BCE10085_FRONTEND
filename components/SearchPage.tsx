"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

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
    length: number;
  };
}

interface SearchResult {
  body: TrademarkData;
  total_pages?: number;
}

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract initial values from URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "nike");
  const [searchCountry, setSearchCountry] = useState(searchParams.get("country") || "us");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync URL params with state
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "nike");
    setSearchCountry(searchParams.get("country") || "us");
    setCurrentPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  // Fetch search results
  const fetchSearchResults = useCallback(async () => {
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

      if (!response.ok) throw new Error("Failed to fetch search results");

      const data: TrademarkData = await response.json();
      const updatedHits = data.hits
        ? {
            ...data.hits,
            hits: data.hits.hits ?? [],
            length: data.hits.hits ? data.hits.hits.length : 0,
          }
        : { hits: [], length: 0 };

      setSearchResults({
        body: { ...data, hits: updatedHits },
        total_pages: data.hits?.total?.value || 0,
      });
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchCountry, currentPage]);

  // Fetch results when dependencies change
  useEffect(() => {
    fetchSearchResults();
  }, [searchQuery, searchCountry, currentPage]);


useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (searchCountry) params.set("country", searchCountry);
    if (currentPage) params.set("page", currentPage.toString());
  
    router.replace(`/search/trademarks?${params.toString()}`); 
  }, [searchQuery, searchCountry, currentPage, router]);
  

  return (
    <div>
      <Navbar
        query={searchQuery}
        page={currentPage}
        country={searchCountry}
        initialResults={searchResults}
        initialError={error}
        error={error || ""}
      />
    </div>
  );
};

export default SearchPage;
