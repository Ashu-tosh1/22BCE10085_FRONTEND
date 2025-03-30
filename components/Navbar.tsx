"use client";

import Loading from "@/app/search/trademarks/Loading";
import NotFound from "@/app/search/trademarks/Not-found";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import TrademarkList from "./TradeMark";

interface SearchFilters {
  status: string[];
  exact_match: boolean;
  owners: string[];
  attorneys: string[];
  law_firms: string[];
  description: string[];
  classes: string[];
  states: string[];
  counties: string[];
}
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
    length: string;
  };
}
interface SearchResult {
  body: TrademarkData;
  total_pages?: number;
}

interface NavbarProps {
  initialResults: SearchResult | null;
  initialError: string | null;
  query: string;
  page: number;
  country: string;
  error: boolean
  searchResults?: { body?: [] };
}

const Navbar: React.FC<NavbarProps> = ({ initialResults, initialError }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchQuery = searchParams.get("q") || "";
  const searchCountry = searchParams.get("country") || "us";
  const currentPage = Number(searchParams.get("page")) || 1;

  const filters: SearchFilters = {
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

  const [searchResults, setSearchResults] = useState<SearchResult | null>(initialResults);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(initialError);
  const [query, setQuery] = useState<string>(searchQuery);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchSearchResults = async () => {
    setLoading(true);
    setError(null);

    const requestBody = {
      input_query: query,
      input_query_type: "",
      sort_by: "default",
      status: filters.status.map((s) => s.toLowerCase()),
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

      const data: SearchResult = await response.json();
      setSearchResults(data);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError("Failed to fetch search results. Please try again.");
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("country", searchCountry);
    params.set("page", "1");

    router.push(`/search/trademarks?${params.toString()}`);
    fetchSearchResults();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/search/trademarks?${params.toString()}`);
  };

  useEffect(() => {
    fetchSearchResults();
  }, [currentPage, searchParams.toString()]);

  return (
    <div>
      {loading && <Loading />}
      {!loading && !error && (!searchResults?.body?.hits?.hits?.length) && <NotFound />}

      <div className="flex ml-[80px] mt-[30px] items-center justify-between w-full max-w-6xl mb-6">
        <Image src="/logo.png" alt="Logo" width={170} height={50} className="cursor-pointer" />
        <div className="flex items-center relative w-2/3">
          <input
            type="text"
            placeholder="Search Trademark Here"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-14 pl-12 px-4 py-2 border border-gray-400 rounded-lg focus:outline-none"
            onKeyDown={(e) => {
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
      {error ? <NotFound /> : searchResults?.body && <TrademarkList data={searchResults.body} />}
      {!loading && !error && searchResults?.body?.hits?.hits && searchResults.body.hits.hits.length > 0 && totalPages > 1 && ( 


        <div className="flex justify-center mt-6 space-x-4">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 rounded-lg">
            Previous
          </button>
          <span className="text-lg font-medium">Page {currentPage} of {totalPages}</span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} className="px-4 py-2 rounded-lg">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;