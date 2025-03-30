"use client";
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, Filter, List, Share2 } from "lucide-react";

const statusColors: Record<string, string> = {
  All: "bg-gray-500",
  Registered: "bg-green-500",
  Pending: "bg-yellow-500",
  Abandoned: "bg-red-500",
  Others: "bg-blue-500",
};

const FilterSidebar = ({ data }: { data: any }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
    console.log(data)
    const updateQuery = (key: string, value: string | string[]) => {
        const params = new URLSearchParams(searchParams.toString());
      
        // If updating search query, reset all filters
        if (key === "q") {
          params.forEach((_, paramKey) => {
            if (paramKey !== "q" && paramKey !== "country") {
              params.delete(paramKey);
            }
          });
        }
      
        // Update filters
        if (Array.isArray(value)) {
          value.length ? params.set(key, value.join(",")) : params.delete(key);
        } else {
          value ? params.set(key, value) : params.delete(key);
        }
      
        // Push the updated URL
        window.history.pushState(null, "", `/search/trademarks?${params.toString()}`);
      };
      
      
      // State for selected status
      const [selectedStatus, setSelectedStatus] = useState<string>("All");
      
      const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        updateQuery("status", status === "All" ? "" : status); // Remove 'status' if 'All' is selected
      };
      
      // Effect to trigger query update on status change
      useEffect(() => {
        updateQuery("status", selectedStatus === "All" ? "" : selectedStatus);
      }, [selectedStatus]);
    ;
    
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"Owners" | "Law Firms" | "Attorneys">("Owners");
  const [viewMode, setViewMode] = useState<"Grid" | "List">("Grid");

  const fetchData = async () => {
    const response = await fetch(`/search/trademarks?${searchParams.toString()}`);
    const newData = await response.json();
    console.log("Fetched data:", newData);
  };
  

  useEffect(() => {
    updateQuery(activeTab.toLowerCase().replace(" ", ""), selectedOwners);
    fetchData();
  }, [selectedOwners, activeTab, searchParams]);

  const owners = data?.aggregations.current_owners?.buckets.map((owner: any) => owner.key) || [];
  const lawFirms = data?.aggregations.law_firms?.buckets.map((firm: any) => firm.key) || [];
  const attorneys = data?.aggregations.attorneys?.buckets.map((attorney: any) => attorney.key) || [];

  const toggleSelection = (item: string) => {
    setSelectedOwners((prev) =>
      prev.includes(item) ? prev.filter((o) => o !== item) : [...prev, item]
    );
  };

  return (
    <div className="w-[350px] p-4 bg-white rounded-xl shadow-md space-y-4">
      <div className="flex justify-between">
        <button className="p-2 flex bg-gray-100 rounded-md items-center">
          <Filter size={20} />
          <span className="ml-2">Filter</span>
        </button>
        <button className="p-2 bg-gray-100 rounded-md">
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
              className={`px-3 py-1 bg-gray-100 flex items-center space-x-2 rounded-lg border-1 text-sm ${selectedStatus === status ? "ring-1 ring-blue bg-blue-400" : ""}`}
              onClick={() => handleStatusChange(status)}
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
              onClick={() => setActiveTab(tab as any)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-center border p-2 rounded-md">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder={`Search ${activeTab}`} className="ml-2 text-sm w-full outline-none" />
        </div>

        <div className="mt-2 max-h-32 overflow-auto">
          {["Owners", "Law Firms", "Attorneys"].map(
            (tab) =>
              activeTab === tab &&
              (tab === "Owners" ? owners : tab === "Law Firms" ? lawFirms : attorneys).map((item) => (
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
              ))
          )}
        </div>
      </div>

      <div className="p-3 bg-white rounded-md shadow-sm flex justify-between">
        <button
          className={`px-3 py-1 rounded-md ${viewMode === "Grid" ? "bg-black text-white" : "bg-gray-200 text-black"}`}
          onClick={() => setViewMode("Grid")}
        >
          Grid View
        </button>
        <button
          className={`px-3 py-1 rounded-md ${viewMode === "List" ? "bg-black text-white" : "bg-gray-200 text-black"}`}
          onClick={() => setViewMode("List")}
        >
          List View
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
