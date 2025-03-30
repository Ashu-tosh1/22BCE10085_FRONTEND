"use client";
import Loading from "@/app/search/trademarks/loading";
import NotFound from "@/app/search/trademarks/Not-found";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import TrademarkList from "./TradeMark";

interface NavbarProps {
  initialResults: object | null;
  initialError: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ initialResults, initialError }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchQuery = searchParams.get("q") || "";
  const searchCountry = searchParams.get("country") || "us";
  const currentPage = Number(searchParams.get("page") || 1);

  // Extract all filter values from URL
  const filters = {
    status: searchParams.getAll("status"),
    exact_match: searchParams.get("exact_match") === "true",
    owners: searchParams.getAll("owners"),
    attorneys: searchParams.getAll("attorneys"),
    law_firms: searchParams.getAll("law_firms"),
    description: searchParams.getAll("description"),
    classes: searchParams.getAll("classes"),
    states: searchParams.getAll("states"),
    counties: searchParams.getAll("counties"),
  };

  const [searchResults, setSearchResults] = useState(initialResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [query, setQuery] = useState(searchQuery); // Controlled input state

  const fetchSearchResults = async () => {
    setLoading(true);
    setError(null);

    const requestBody = {
      input_query: searchQuery,
      input_query_type: "",
      sort_by: "default",
      status: filters.status.map(s => s.toLowerCase()), // Avoid sending empty array
      exact_match: filters.exact_match,
      date_query: false,
      owners: filters.owners,
      attorneys: filters.attorneys,
      law_firms: filters.law_firms,
      mark_description_description: filters.description,
      classes: filters.classes,
      page: currentPage,
      rows: 10,
      sort_order: "desc",
      states: filters.states,
      counties: filters.counties,
    };
    

    console.log("Sending request with:", requestBody);

    try {
      const response = await fetch("https://vit-tm-task.api.trademarkia.app/api/v3/us", {
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

  // Update the URL and fetch new results when search button is clicked
  const handleSearch = () => {
    const params = new URLSearchParams(); // Clear all existing queries
    
    if (query) params.set("q", query);
    params.set("country", searchCountry);
    params.set("page", "1"); // Reset to first page

    // 🚀 Push updated search query with only q and country
    router.push(`/search/trademarks?${params.toString()}`);

    // Fetch updated results
    fetchSearchResults();
  };

  
  
  

  useEffect(() => {
    fetchSearchResults();
  }, [searchParams.toString()]); // Re-fetch when any search param changes

  return (
    <div>
      {loading && <Loading />}
      {!loading && !error && (!searchResults?.body || searchResults.body.length === 0) && <NotFound />}

      <div className="flex ml-[80px] mt-[30px] items-center justify-between w-full max-w-6xl mb-6">
        <Image src="/logo.png" alt="Logo" width={170} height={50} className="cursor-pointer" />
        <div className="flex items-center relative w-2/3">
          <input
            type="text"
            placeholder="Search Trademark Here"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-14 pl-12 px-4 py-2 border border-gray-400 rounded-lg focus:outline-none"
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={24} />
          <button
            onClick={handleSearch}
            className="ml-4 h-14 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 text-lg"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>
      </div>

      {/* Error and Results Section */}
      {error ? (
  <NotFound />
) : 
  (
          searchResults?.body && <TrademarkList data={searchResults.body} />
  ) 
}

    </div>
  );
};

export default Navbar;
