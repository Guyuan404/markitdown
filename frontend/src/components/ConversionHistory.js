import React from 'react';

function ConversionHistory({ conversions, onSelect }) {
  if (!conversions.length) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Conversion History</h2>
        <p className="text-gray-500 text-center">No conversions yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Conversion History</h2>
      <div className="space-y-2">
        {conversions.map((conversion) => (
          <div
            key={conversion.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
            onClick={() => onSelect(conversion)}
          >
            <div>
              <p className="font-medium text-gray-900">{conversion.filename}</p>
              <p className="text-sm text-gray-500">
                {new Date(conversion.timestamp).toLocaleString()}
              </p>
            </div>
            <span
              className={`px-2 py-1 text-sm rounded-full ${
                conversion.status === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {conversion.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConversionHistory;
