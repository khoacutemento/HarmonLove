// import React from "react";

// const ProgressBar = ({ step }) => {
//   return (
//     <div class="mb-5 mt-auto flex w-full items-center justify-between">
//       <div class="relative flex flex-1 flex-col items-center">
//         <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 font-bold text-white">
//           1
//         </div>
//         <div class="mt-2 text-sm">First</div>
//       </div>
//       <div class="relative flex flex-1 flex-col items-center">
//         <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 font-bold text-white">
//           2
//         </div>
//         <div class="mt-2 text-sm">Second</div>
//         <div class="absolute left-[-50%] top-5 -z-10 w-full border-b-2 border-green-500"></div>
//       </div>
//       <div class="relative flex flex-1 flex-col items-center font-bold">
//         <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 font-bold text-white">
//           3
//         </div>
//         <div class="mt-2 text-sm">Third</div>
//         <div class="absolute left-[-50%] top-5 -z-10 w-full border-b-2 border-gray-400"></div>
//       </div>
//       <div class="relative flex flex-1 flex-col items-center">
//         <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 font-bold text-white">
//           4
//         </div>
//         <div class="mt-2 text-sm">Fourth</div>
//         <div class="absolute left-[-50%] top-5 -z-10 w-full border-b-2 border-gray-400"></div>
//       </div>
//     </div>
//   );
// };

// export default ProgressBar;
import React from "react";

const ProgressBar = ({ step }) => {
  return (
    <div className="mb-5 mt-auto flex w-full items-center justify-between">
      {[1, 2, 3].map((num, index) => (
        <div key={num} className="relative flex flex-1 flex-col items-center">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${
              num <= step ? "bg-text" : "bg-gray-400"
            }`}
          >
            {num}
          </div>
          {/* <div className="mt-2 text-sm">
            {num === 1
              ? "First"
              : num === 2
                ? "Second"
                : num === 3
                  ? "Third"
                  : "Fourth"}
          </div> */}
          {index > 0 && (
            <div
              className={`absolute left-[-50%] top-5 -z-10 w-full border-b-2 ${
                num <= step ? "border-text" : "border-gray-400"
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;
