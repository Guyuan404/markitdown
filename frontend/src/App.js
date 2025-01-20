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

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      setConversions(data);
    } catch (error) {
      toast.error('Failed to load conversion history');
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const downloadFiles = async (files = convertedFiles) => {
    if (files.length === 0) {
      toast.info('No files to download');
      return;
    }

    if (files.length === 1) {
      // 单文件下载
      const file = files[0];
      const blob = new Blob([file.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = file.filename 
        ? file.filename.replace(/\.[^/.]+$/, '') + '.md'
        : 'converted.md';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // 多文件打包下载
      const zip = new JSZip();
      files.forEach((file) => {
        const filename = file.filename
          ? file.filename.replace(/\.[^/.]+$/, '') + '.md'
          : 'converted.md';
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

  const handleFileSelect = async (file, shouldDownload) => {
    setIsUploading(true);
    setUploadProgress(0);
    setConvertedContent('');
    setConvertedFiles([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/convert', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      const { markdown_content, filename } = response.data;
      setConvertedContent(markdown_content);
      setConvertedFiles([{ content: markdown_content, filename }]);
      
      if (shouldDownload) {
        downloadFiles([{ content: markdown_content, filename }]);
      }
      
      loadHistory();
      toast.success('File converted successfully');
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error(error.response?.data?.detail || 'Failed to convert file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleHistorySelect = async (conversion) => {
    try {
      const response = await fetch(`/api/conversion/${conversion.id}`);
      if (!response.ok) {
        throw new Error('Failed to load conversion');
      }
      const data = await response.json();
      setConvertedContent(data.converted_content || data.markdown_content);
      setConvertedFiles([{
        content: data.converted_content || data.markdown_content,
        filename: conversion.filename
      }]);
    } catch (error) {
      console.error('History load error:', error);
      toast.error('Failed to load conversion');
    }
  };

  const handleDelete = async (conversionId) => {
    try {
      await fetch(`/api/conversion/${conversionId}`, {
        method: 'DELETE',
      });
      toast.success('Conversion deleted');
      loadHistory();
    } catch (error) {
      toast.error('Failed to delete conversion');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">MarkItDown</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <FileUpload
            onFileSelect={handleFileSelect}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            toast={toast}
          />
          <ConversionHistory
            conversions={conversions}
            onSelect={handleHistorySelect}
            onDelete={handleDelete}
          />
        </div>
        <div>
          <MarkdownPreview
            content={convertedContent}
            onDownload={() => downloadFiles()}
          />
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
