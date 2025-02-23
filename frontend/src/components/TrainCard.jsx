import React from "react";

const TrainCard = ({ train }) => {
  return (
    //   <li
    //     key={train.train_number}
    //     className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    //   >
    //     <div className="flex justify-between items-start mb-4">
    //       <div>
    //         <h3 className="text-lg font-semibold text-gray-800 mb-1">
    //           {train.train_name}
    //           <span className="text-blue-600 font-medium">
    //             ({train.train_number})
    //           </span>
    //         </h3>
    //         <div className="flex items-center space-x-2 text-sm text-gray-600">
    //           <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
    //             {train.duration}
    //           </span>
    //           <span>{train.train_date}</span>
    //         </div>
    //       </div>
    //       <div className="flex flex-col items-end space-y-1">
    //         <span className="text-sm font-medium text-gray-700">Class</span>
    //         <div className="flex space-x-1">
    //           {train.class_type?.map((cls) => (
    //             <span
    //               key={cls}
    //               className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
    //             >
    //               {cls}
    //             </span>
    //           ))}
    //         </div>
    //       </div>
    //     </div>

    //     <div className="flex justify-between">
    //       <div className="space-y-2">
    //         <p className="font-medium text-gray-900">
    //           {train.from_station_name} ({train.from})
    //         </p>
    //         <div className="text-sm text-gray-600">
    //           <p>Scheduled Departure: {train.from_std}</p>
    //           <p>Actual Departure: {train.from_sta}</p>
    //         </div>
    //       </div>

    //       <div className="text-center">
    //         <div className="w-8 h-px bg-gray-300 mt-3"></div>
    //       </div>

    //       <div className="space-y-2 text-right">
    //         <p className="font-medium text-gray-900">
    //           {train.to_station_name} ({train.to})
    //         </p>
    //         <div className="text-sm text-gray-600">
    //           <p>Scheduled Arrival: {train.to_sta}</p>
    //           <p>Actual Arrival: {train.to_std}</p>
    //         </div>
    //       </div>
    //     </div>
    //   </li>

    <li class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-1">
            MUMBAI BANDRA T - SMVD KATRA Swaraj SF Express
            <span class="text-blue-600 font-medium">(12471)</span>
          </h3>
          <div class="flex items-center space-x-2 text-sm text-gray-600">
            <span class="bg-green-100 text-green-700 px-2 py-1 rounded">
              17:59
            </span>
            <span>26-05-2023</span>
          </div>
        </div>
        <div class="flex flex-col items-end space-y-1">
          <span class="text-sm font-medium text-gray-700">Class</span>
          <div class="flex space-x-1">
            <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              SL
            </span>
            <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              3A
            </span>
            <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              2A
            </span>
            <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              1A
            </span>
          </div>
        </div>
      </div>

      <div class="flex justify-between">
        <div class="space-y-2">
          <p class="font-medium text-gray-900">BORIVALI (BVI)</p>
          <div class="text-sm text-gray-600">
            <p>Departure: 11:26</p>
            <p>Scheduled Arrival: 11:23</p>
          </div>
        </div>

        <div class="text-center">
          <div class="w-8 h-px bg-gray-300 mt-3"></div>
        </div>

        <div class="space-y-2 text-right">
          <p class="font-medium text-gray-900">NEW DELHI (NDLS)</p>
          <div class="text-sm text-gray-600">
            <p>Scheduled Arrival: 05:25</p>
            <p>Departure: 05:40</p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default TrainCard;
