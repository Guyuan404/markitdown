import React, { useState } from 'react';

function ConversionHistory({ conversions, onSelect, onDelete }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  if (!conversions.length) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Conversion History</h2>
        <p className="text-gray-500 text-center">No conversions yet</p>
      </div>
    );
  }

  const handleDelete = (conversionId) => {
    setDeleteConfirm(conversionId);
  };

  const confirmDelete = (conversionId) => {
    onDelete(conversionId);
    setDeleteConfirm(null);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Conversion History</h2>
      <div className="space-y-2">
        {conversions.map((conversion) => (
          <div
            key={conversion.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
          >
            <div 
              className="flex-grow cursor-pointer"
              onClick={() => onSelect(conversion)}
            >
              <p className="font-medium text-gray-900">{conversion.filename}</p>
              <p className="text-sm text-gray-500">
                {new Date(conversion.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`px-2 py-1 text-sm rounded-full ${
                  conversion.status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {conversion.status}
              </span>
              {deleteConfirm === conversion.id ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => confirmDelete(conversion.id)}
                    className="text-sm px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="text-sm px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleDelete(conversion.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConversionHistory;
