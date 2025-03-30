// import Navbar from "@/components/Navbar";
// import React from "react";

// const Page = async ({ searchParams }) => {
//   // Extract query parameters from the URL
//   const query = searchParams.q || "nike" // Search keyword
//   const view = searchParams.view || "list"; // View type (list/grid)
//   const page = searchParams.page || 1; // Pagination
//   const country = searchParams.country || "us"; // Country filter

//   let initialResults = null;
//   let initialError = null;

//   if (query) {
//     const requestBody = {
//       input_query: query,
//       input_query_type: "",
//       sort_by: "default",
//       status: [],
//       exact_match: false,
//       date_query: false,
//       owners: [],
//       attorneys: [],
//       law_firms: [],
//       mark_description_description: [],
//       classes: [],
//       page: Number(page),
//       rows: 10,
//       sort_order: "desc",
//       states: [],
//       counties: [],
//     };

//     try {
//       const response = await fetch("https://vit-tm-task.api.trademarkia.app/api/v3/us", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
//         },
//         body: JSON.stringify(requestBody),
//       });

//       const responseText = await response.text();

//       if (!response.ok) {
//         throw new Error(`Server Error: ${response.status} ${response.statusText}`);
//       }

//       try {
//         initialResults = JSON.parse(responseText);
//       } catch {
//         console.error("Invalid JSON response from server:", responseText);
//         throw new Error("Invalid JSON response from server.");
//       }
//     } catch (err) {
//       console.error("Error fetching search results:", err);
//       initialError = err.message;
//     }
//   }

//   console.log("Initial Results:", initialResults);
//   console.log("Initial Error:", initialError);

//   return (
//     <div>
//       {/* Pass consistent props */}
//       <Navbar
//         query={query}
//         view={view}
//         page={page}
//         country={country}
//         initialResults={initialResults || null}
//         initialError={initialError || null}
//       />
//     </div>
//   );
// };

// export default Page;
