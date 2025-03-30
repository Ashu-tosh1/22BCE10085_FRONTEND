"use client";

import { Suspense } from "react";
import SearchPage from "@/components/SearchPage"; 

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPage />
    </Suspense>
  );
};

export default Page;
