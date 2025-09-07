import React from 'react';

export const TruckHiringNotes: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Truck Hiring Notes</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Add New THN
        </button>
      </div>
      <div>
        <p>THN List View will be implemented here.</p>
      </div>
    </div>
  );
};
