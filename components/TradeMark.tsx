import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React from "react";
import FilterSidebar from "./Filter";

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
  aggregations?: Aggregations; // Include this to match FilterSidebar props
}

interface AggregationBucket {
  key: string;
}

interface Aggregations {
  current_owners?: { buckets: AggregationBucket[] };
  law_firms?: { buckets: AggregationBucket[] };
  attorneys?: { buckets: AggregationBucket[] };
}

const TrademarkPage = ({ data }: { data: TrademarkData }) => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return "No description";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const trademarks = data?.hits?.hits?.map((hit) => ({
    _id: hit._id,
    mark_identification: hit._source.mark_identification,
    current_owner: hit._source.current_owner,
    registration_number: hit._source.registration_number,
    registration_date: hit._source.registration_date
      ? new Date(hit._source.registration_date * 1000).toLocaleDateString()
      : "N/A",
    renewal_date: hit._source.renewal_date
      ? new Date(hit._source.renewal_date * 1000).toLocaleDateString()
      : null,
    status_type: hit._source.status_type,
    mark_description_description: hit._source.mark_description_description || [],
    class_codes: hit._source.class_codes || [],
  }));

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex">
      <div className="w-[68vw]">
        <h2 className="text-2xl font-bold mb-4">
          About {data?.hits?.total?.value || 0} Trademarks found for &quot;{query}&quot;
        </h2>
        <div className="bg-white shadow rounded-lg">
          <div className="grid grid-cols-4 bg-gray-200 text-sm font-bold p-4 border-b">
            <span>Mark</span>
            <span>Details</span>
            <span>Status</span>
            <span>Class/Description</span>
          </div>
          {trademarks?.map((tm) => (
            <div key={tm._id} className="grid grid-cols-4 p-4 border-b bg-gray-100 hover:bg-gray-200">
              <div className="w-[158px] h-[120px] bg-white flex items-center justify-center rounded-md border">
                <Image src="/unavailable.png" alt="Unavailable" width={54.35} height={61} />
              </div>
              <div className="h-[108px] w-[200px]">
                <h3 className="text-sm font-bold">{tm.mark_identification}</h3>
                <p className="text-sm text-gray-700">{tm.current_owner}</p>
                <p className="text-sm mt-8 font-bold">{tm.registration_number}</p>
                <p className="text-sm text-gray-700">{tm.registration_date}</p>
              </div>
              <div className="flex flex-col items-start">
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full ${tm.status_type === "abandoned" ? "bg-red-600" : "bg-green-600"}`}></span>
                  <p className={`font-bold ${tm.status_type === "abandoned" ? "text-red-600" : "text-green-600"}`}>
                    {tm.status_type === "abandoned" ? "Dead/Abandoned" : "Live/Registered"}
                  </p>
                </div>
                {tm.renewal_date && tm.renewal_date !== "N/A" && (
                  <div className="flex mt-7 items-center">
                    <Image src="/renewal.png" alt="Renewal" width={24} height={24} />
                    <p className="text-sm font-medium">{tm.renewal_date}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold line-clamp-2">
                  {tm.mark_description_description.length > 0
                    ? truncateText(tm.mark_description_description.join(", "), 150)
                    : "No description"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-[105px] ml-3">
        <FilterSidebar data={{ aggregations: data.aggregations }} />
      </div>
    </div>
  );
};

export default TrademarkPage;
