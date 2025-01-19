import React from 'react';
import ReactMarkdown from 'react-markdown';

function MarkdownPreview({ content }) {
  if (!content) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm h-full">
        <h2 className="text-xl font-semibold mb-4">Preview</h2>
        <p className="text-gray-500 text-center">
          Convert a file to see the preview here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Preview</h2>
        <button
          onClick={() => {
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'converted.md';
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Download
        </button>
      </div>
      <div className="prose max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

export default MarkdownPreview;
