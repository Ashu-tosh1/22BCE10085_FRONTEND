"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, List, Share2 } from "lucide-react";

interface AggregationBucket {
  key: string;
}

interface Aggregations {
  current_owners?: { buckets: AggregationBucket[] };
  law_firms?: { buckets: AggregationBucket[] };
  attorneys?: { buckets: AggregationBucket[] };
}

interface FilterSideBarprops {
  results?: Array<string>;
  aggregations?: Aggregations;
}

const statusColors: Record<string, string> = {
  All: "bg-gray-500",
  Registered: "bg-green-500",
  Pending: "bg-yellow-500",
  Abandoned: "bg-red-500",
  Others: "bg-blue-500",
};

const FilterSidebar = ({ data }: { data: FilterSideBarprops }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get("status") || "All");
  const [selectedOwners, setSelectedOwners] = useState<string[]>(searchParams.getAll("owners") || []);
  const [activeTab, setActiveTab] = useState<"Owners" | "Law Firms" | "Attorneys">("Owners");
  const [viewMode] = useState<"Grid" | "List">("Grid");

  const owners = data.aggregations?.current_owners?.buckets.map((owner) => owner.key) || [];
  const lawFirms = data.aggregations?.law_firms?.buckets.map((firm) => firm.key) || [];
  const attorneys = data.aggregations?.attorneys?.buckets.map((attorney) => attorney.key) || [];

  const updateFiltersInURL = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", selectedStatus);
    params.delete("owners");
    selectedOwners.forEach((owner) => params.append("owners", owner));

    router.push(`/search/trademarks?${params.toString()}`);
  };

  useEffect(() => {
    updateFiltersInURL();
  }, [selectedStatus, selectedOwners]);

  const toggleSelection = (item: string) => {
    setSelectedOwners((prev) =>
      prev.includes(item) ? prev.filter((o) => o !== item) : [...prev, item]
    );
  };

  const handleShare = async () => {
    const filters = {
      status: selectedStatus,
      owners: selectedOwners.length ? selectedOwners.join(", ") : "None",
      activeTab,
      viewMode,
      searchParams: searchParams.toString(),
    };

    const results = data.results || [];
    const shareData = {
      title: "Search Results",
      text: `Filters: ${JSON.stringify(filters, null, 2)}\nResults: ${results.length} items found.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log("Data shared successfully");
      } catch (error) {
        console.error("Error sharing data:", error);
      }
    } else {
      console.warn("Web Share API not supported");
      alert("Your browser does not support sharing.");
    }
  };

  return (
    <div className="w-[350px] h-[700px] p-4 bg-white rounded-xl shadow-md space-y-4">
      <div className="flex justify-between">
        <button className="p-2 flex bg-gray-100 rounded-md items-center">
          <Filter size={20} />
          <span className="ml-2">Filter</span>
        </button>
        <button className="p-2 hover:cursor-pointer bg-gray-100 rounded-md" onClick={handleShare}>
          <Share2 size={20} />
        </button>
        <button className="p-2 bg-gray-100 rounded-md">
          <List size={20} />
        </button>
      </div>

      <div className="p-3 rounded-md shadow-sm">
        <h3 className="text-sm font-semibold mb-2">Status</h3>
        <div className="flex flex-wrap gap-2">
          {["All", "Registered", "Pending", "Abandoned", "Others"].map((status) => (
            <button
              key={status}
              className={`px-3 py-1 bg-gray-100 flex items-center space-x-2 rounded-lg border-1 text-sm ${
                selectedStatus === status ? "ring-1 ring-blue bg-blue-400" : ""
              }`}
              onClick={() => setSelectedStatus(status)}
            >
              <span className={`w-2 h-2 rounded-full ${statusColors[status]}`}></span>
              <span>{status}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-white rounded-md shadow-sm">
        <div className="flex space-x-4 border-b pb-2">
          {["Owners", "Law Firms", "Attorneys"].map((tab) => (
            <button
              key={tab}
              className={`text-sm font-medium ${activeTab === tab ? "border-b-2 border-black" : "text-gray-500"}`}
              onClick={() => setActiveTab(tab as "Owners" | "Law Firms" | "Attorneys")}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-center border p-2 rounded-md">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder={`Search ${activeTab}`} className="ml-2 text-sm w-full outline-none" />
        </div>

        <div className="mt-2 max-h-70 overflow-auto">
          {(activeTab === "Owners" ? owners : activeTab === "Law Firms" ? lawFirms : attorneys).map((item) => (
            <label key={item} className="flex items-center space-x-2 py-1">
              <input
                type="checkbox"
                checked={selectedOwners.includes(item)}
                onChange={() => toggleSelection(item)}
                className="form-checkbox text-blue-500"
              />
              <span className={`text-sm uppercase ${selectedOwners.includes(item) ? "text-blue-500" : "text-black"}`}>
                {item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;