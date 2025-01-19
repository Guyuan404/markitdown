import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FileUpload from './components/FileUpload';
import ConversionHistory from './components/ConversionHistory';
import MarkdownPreview from './components/MarkdownPreview';
import JSZip from 'jszip';
import axios from 'axios';

function App() {
  const [conversions, setConversions] = useState([]);
  const [convertedContent, setConvertedContent] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch('/api/history');
        const data = await response.json();
        setConversions(data);
      } catch (error) {
        toast.error('Failed to load conversion history');
      }
    };
    loadHistory();
  }, []);

  const downloadFiles = async () => {
    if (convertedFiles.length === 0) {
      toast.info('No files to download');
      return;
    }

    if (convertedFiles.length === 1) {
      // 单文件下载
      const file = convertedFiles[0];
      const blob = new Blob([file.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // 确保文件名存在，如果不存在则使用默认名称
      const filename = file.filename 
        ? file.filename.replace(/\.[^/.]+$/, '') + '.md'
        : 'converted.md';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // 批量下载为 ZIP
      const zip = new JSZip();
      
      convertedFiles.forEach((file, index) => {
        // 确保文件名存在，如果不存在则使用默认名称
        const filename = file.filename 
          ? file.filename.replace(/\.[^/.]+$/, '') + '.md'
          : `converted_${index + 1}.md`;
        zip.file(filename, file.content);
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted_files.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleFileConversion = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/convert', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.data.type === 'zip') {
        setConvertedFiles(response.data.files.filter(f => f.status === 'success'));
        setConvertedContent(
          response.data.files
            .map(f => `# ${f.filename}\n\n${f.content}`)
            .join('\n\n---\n\n')
        );
        
        const successCount = response.data.files.filter(f => f.status === 'success').length;
        const failCount = response.data.files.filter(f => f.status === 'error').length;
        
        toast.success(
          `Successfully converted ${successCount} file${successCount !== 1 ? 's' : ''}` +
          (failCount > 0 ? `, ${failCount} file${failCount !== 1 ? 's' : ''} failed` : '')
        );
      } else {
        setConvertedContent(response.data.content);
        setConvertedFiles([{
          filename: response.data.filename,
          content: response.data.content
        }]);
        toast.success('File converted successfully!');
      }
      
      // 更新历史记录
      setConversions(prev => [{
        id: Date.now(),
        filename: file.name,
        timestamp: new Date().toISOString(),
        status: 'success'
      }, ...prev]);
      
    } catch (error) {
      toast.error('Failed to convert file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">MarkItDown</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <FileUpload 
              onFileSelect={handleFileConversion}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              toast={toast}
            />
            
            {convertedFiles.length > 0 && (
              <div className="mb-8">
                <button
                  onClick={downloadFiles}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-300"
                >
                  Download {convertedFiles.length > 1 ? 'All Files (ZIP)' : 'Converted File'}
                </button>
              </div>
            )}
            
            <ConversionHistory 
              conversions={conversions}
              onSelect={(conversion) => {
                setConvertedContent(conversion.converted_content);
              }}
            />
          </div>
          
          <div>
            <MarkdownPreview content={convertedContent} />
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
