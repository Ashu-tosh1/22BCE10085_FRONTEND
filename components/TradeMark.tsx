"use client";

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
}

const TrademarkPage = ({ data }: { data: TrademarkData }) => {
  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return "No description";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const searchParams = useSearchParams();
  const paramsObject = Object.fromEntries(searchParams.entries());

  console.log(paramsObject.q);
  console.log(data);

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
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">
            About {data?.hits?.total?.value || 0} Trademarks found for &quot;
            {paramsObject.q}&quot;
          </h2>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="grid grid-cols-4 bg-gray-200 text-sm font-bold p-4 border-b border-gray-200">
            <span>Mark</span>
            <span>Details</span>
            <span>Status</span>
            <span>Class/Description</span>
          </div>

          {trademarks?.map((tm) => (
            <div
              key={tm._id}
              className="grid grid-cols-4 items-start p-4 border-b border-1 shadow-sm bg-gray-100 hover:bg-gray-200 border-gray-300 last:border-0"
            >
              {/* Mark Image */}
              <div className="flex items-center">
                <div className="w-[158px] h-[120px] bg-white flex items-center justify-center rounded-md border border-gray-300">
                  <Image
                    src="/unavailable.png"
                    alt="Unavailable"
                    width={54.35}
                    height={61}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Trademark Details */}
              <div className="h-[108px] w-[200px]">
                <h3 className="text-sm font-bold">{tm.mark_identification}</h3>
                <p className="text-sm text-gray-700">{tm.current_owner}</p>
                <p className="text-sm mt-8 text-black font-bold">
                  {tm.registration_number}
                </p>
                <p className="text-sm text-gray-700">{tm.registration_date}</p>
              </div>

              {/* Status */}
              <div className="flex flex-col items-start space-y-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      tm.status_type === "abandoned" ? "bg-red-600" : "bg-green-600"
                    }`}
                  ></span>
                  <p
                    className={`text-m font-bold ${
                      tm.status_type === "abandoned" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {tm.status_type === "abandoned" ? "Dead/Abandoned" : "Live/Registered"}
                  </p>
                </div>
                <p className="text-m text-gray-700">
                  on{" "}
                  <span className="font-bold text-black">{tm.registration_date}</span>
                </p>

                {/* Renewal Date */}
                {tm.renewal_date && tm.renewal_date !== "N/A" && (
                  <div className="flex mt-7 items-center space-x-2">
                    <Image
                      src="/renewal.png"
                      alt="Renewal Icon"
                      width={24}
                      height={24}
                    />
                    <p className="text-sm font-medium text-black">{tm.renewal_date}</p>
                  </div>
                )}
              </div>

              {/* Class/Description */}
              <div>
                <p
                  className="text-m font-semibold text-gray-700 line-clamp-2 overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                  }}
                >
                  {tm.mark_description_description.length > 0
                    ? truncateText(tm.mark_description_description.join(", "), 150)
                    : "No description"}
                </p>

                {/* Class Codes */}
                <div className="flex flex-wrap gap-2 mt-10 items-center">
                  {tm.class_codes.slice(0, 2).map((cls, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Image src="/class.png" alt={`Class ${cls}`} width={18} height={18} />
                      <span className="text-sm font-medium text-gray-600">{`Class ${cls}`}</span>
                    </div>
                  ))}

                  {tm.class_codes.length > 3 && (
                    <span className="text-sm font-medium text-gray-600">...</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="mt-[105px] ml-3">
        <FilterSidebar data={data} />
      </div>
    </div>
  );
};

export default TrademarkPage;
