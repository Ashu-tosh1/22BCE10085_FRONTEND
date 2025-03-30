"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React from "react";
import FilterSidebar from "./Filter";

const TrademarkPage = ({ data }: { data: any }) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return `${text.slice(0, maxLength)}...`;
    }
    return text;
  };

  const searchParams = useSearchParams();
  const paramsObject = Object.fromEntries(searchParams.entries());

  console.log(paramsObject.q);
  console.log(data);

  const trademarks = data?.hits?.hits.map((hit: any) => ({
    _id: hit._id,
    mark_identification: hit._source.mark_identification,
    current_owner: hit._source.current_owner,
    registration_number: hit._source.registration_number,
    registration_date: new Date(
      hit._source.registration_date * 1000
    ).toLocaleDateString(),
    renewal_date: new Date(
      hit._source.renewal_date * 1000
    ).toLocaleDateString(),
    status_type: hit._source.status_type,
    mark_description_description:
      hit._source.mark_description_description || [],
    class_codes: hit._source.class_codes || [],
  }));

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex">
      <div className="w-[68vw] h-[120px]">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">
            About {data?.hits?.total?.value || 0} Trademarks found for "
            {paramsObject.q}"
          </h2>
          <div className="flex space-x-2 mb-4">
            <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full">
              *ke
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full">
              *ike
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="grid grid-cols-4 bg-gray-200 text-sm font-bold p-4 border-b border-gray-200">
            <span>Mark</span>
            <span>Details</span>
            <span>Status</span>
            <span>Class/Description</span>
          </div>

          {trademarks.map((tm) => (
            <div
              key={tm._id}
              className="grid grid-cols-4 items-start p-4 border-b border-1 shadow-sm bg-gray-100 hover:bg-gray-200 border-gray-300 last:border-0"
            >
              {/* Mark */}
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

              {/* Details */}
              <div className="h-[108px] w-[200px]">
                <h3 className="text-sm font-bold">{tm.mark_identification}</h3>
                <p className="text-sm width-[200px] text-gray-700">
                  {tm.current_owner}
                </p>
                <p className="text-sm mt-8 text-black font-bold">
                  {tm.registration_number}
                </p>
                <p className="text-sm text-gray-700">{tm.registration_date}</p>
              </div>

              {/* Status */}
              <div className="flex flex-col items-start space-y-2">
                {/* Status Indicator */}
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      tm.status_type === "abandoned"
                        ? "bg-red-600"
                        : "bg-green-600"
                    }`}
                  ></span>
                  <p
                    className={`text-m font-bold ${
                      tm.status_type === "abandoned"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {tm.status_type === "abandoned"
                      ? "Dead/Abandoned"
                      : "Live/Registered"}
                  </p>
                </div>

                <p className="text-m text-gray-700">
                  on{" "}
                  <span className="font-bold text-black">
                    {tm.registration_date}
                  </span>
                </p>

                {/* Renewal Date */}
                {tm.renewal_date && tm.renewal_date !== "Invalid Date" && (
                  <div className="flex mt-7 items-center space-x-2">
                    <span className="text-red-600">
                      <Image
                        src="/renewal.png"
                        alt="Renewal Icon"
                        width={24}
                        height={24}
                      />
                    </span>
                    <p className="text-sm font-medium text-black">
                      {tm.renewal_date}
                    </p>
                  </div>
                )}
              </div>

              {/* Class/Description */}
              <div>
                {/* Description */}
                <p
                  className="text-m font-semibold text-gray-700 line-clamp-2 overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                  }}
                >
                  {tm.mark_description_description.length > 0
                    ? truncateText(
                        tm.mark_description_description.join(", "),
                        150
                      )
                    : "No description"}
                </p>

                {/* Class Codes */}
                <div className="flex flex-wrap gap-2 mt-10 items-center">
                  {tm.class_codes.slice(0, 2).map((cls, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Image
                        src="/class.png"
                        alt={`Class ${cls}`}
                        width={18}
                        height={18}
                      />
                      <span className="text-sm font-medium text-gray-600">{`Class ${cls}`}</span>
                    </div>
                  ))}

                  {/* Show "..." if more than 3 classes exist */}
                  {tm.class_codes.length > 3 && (
                    <span className="text-sm font-medium text-gray-600">
                      ...
                    </span>
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
