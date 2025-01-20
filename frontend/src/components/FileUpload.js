import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const SUPPORTED_FORMATS = [
  'txt', 'pdf', 'docx', 'xlsx', 'pptx', 'html', 'md', 'zip',
  'bmp', 'gif', 'jpeg', 'jpg', 'png', 'webp',
  'mp3', 'wav', 'msg', 'rtf', 'xls'
];

function FileUpload({ onFileSelect, isUploading, uploadProgress, toast }) {
  const [downloadAfterConversion, setDownloadAfterConversion] = useState(false);

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    if (!SUPPORTED_FORMATS.includes(extension)) {
      toast.error(`Unsupported file format. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`);
      return;
    }

    onFileSelect(file, downloadAfterConversion);
  }, [onFileSelect, toast, downloadAfterConversion]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: isUploading,
    accept: SUPPORTED_FORMATS.map(format => `.${format}`).join(','),
  });

  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center transition-all duration-300 mb-4
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} />
        <div className="text-gray-600">
          {isUploading ? (
            <div>
              <p className="mb-2">Uploading file... {uploadProgress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : isDragActive ? (
            <p>Drop the file here</p>
          ) : (
            <div>
              <p>Drag and drop a file here, or click to select a file</p>
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: {SUPPORTED_FORMATS.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="downloadAfterConversion"
          checked={downloadAfterConversion}
          onChange={(e) => setDownloadAfterConversion(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="downloadAfterConversion" className="ml-2 text-sm text-gray-600">
          Download file after conversion
        </label>
      </div>
    </div>
  );
}

export default FileUpload;
