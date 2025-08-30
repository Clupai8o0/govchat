"use client";

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader,
  FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UploadedFile } from '@/lib/types';

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  uploadedFiles: UploadedFile[];
  onRemoveFile: (id: string) => void;
  isUploading?: boolean;
  className?: string;
}

interface DragDropZoneProps {
  onDrop: (files: File[]) => void;
  isUploading: boolean;
}

function DragDropZone({ onDrop, isUploading }: DragDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    onDrop(files);
  }, [onDrop]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onDrop(files);
    e.target.value = ''; // Reset input
  }, [onDrop]);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
        isDragOver 
          ? "border-violet-400 bg-violet-500/10" 
          : "border-white/20 bg-white/[0.02]",
        isUploading && "pointer-events-none opacity-50"
      )}
    >
      <input
        type="file"
        multiple
        accept=".pdf,.csv,.txt,.md,.json,.xml,.html,.yaml,.yml,.log,.rst"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />
      
      <motion.div
        animate={isDragOver ? { scale: 1.05 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        <div className={cn(
          "w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors",
          isDragOver ? "bg-violet-500" : "bg-white/10"
        )}>
          {isUploading ? (
            <Loader className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-white" />
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {isDragOver ? 'Drop files here' : 'Upload Documents'}
          </h3>
          <p className="text-sm text-white/60 mb-4">
            Drag and drop files or click to browse
          </p>
          <p className="text-xs text-white/40">
            Supported: PDF, CSV, TXT, MD, JSON, XML, HTML, YAML, etc.
          </p>
        </div>
        
        {!isUploading && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            Browse Files
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

interface FileItemProps {
  file: UploadedFile;
  onRemove: (id: string) => void;
}

function FileItem({ file, onRemove }: FileItemProps) {
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-4 h-4 text-red-400" />;
    if (type.includes('csv')) return <File className="w-4 h-4 text-green-400" />;
    if (type.includes('text') || type.includes('markdown')) return <FileText className="w-4 h-4 text-blue-400" />;
    return <File className="w-4 h-4 text-white/60" />;
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'processing':
        return <Loader className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'indexed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'indexed':
        return 'Indexed';
      case 'error':
        return 'Error';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]"
    >
      <div className="flex-shrink-0">
        {getFileIcon(file.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white truncate">{file.name}</p>
          <div className="flex items-center gap-1">
            {getStatusIcon(file.status)}
            <span className="text-xs text-white/60">{getStatusText(file.status)}</span>
          </div>
        </div>
        <p className="text-xs text-white/40">{formatFileSize(file.size)}</p>
      </div>
      
      <button
        onClick={() => onRemove(file.id)}
        className="flex-shrink-0 p-1 text-white/40 hover:text-white/80 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function FileUpload({ 
  onFilesUploaded,
  uploadedFiles,
  onRemoveFile,
  isUploading = false,
  className 
}: FileUploadProps) {
  const handleFileDrop = useCallback(async (files: File[]) => {
    // Create uploaded file objects
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
    }));

    // Simulate upload process
    onFilesUploaded(newFiles);

    // Simulate processing
    for (const file of newFiles) {
      setTimeout(() => {
        // Update status to processing
        file.status = 'processing';
        onFilesUploaded([...uploadedFiles, file]);
      }, 1000);

      setTimeout(() => {
        // Update status to indexed
        file.status = 'indexed';
        onFilesUploaded([...uploadedFiles, file]);
      }, 3000);
    }
  }, [onFilesUploaded, uploadedFiles]);

  const indexedCount = uploadedFiles.filter(f => f.status === 'indexed').length;
  const processingCount = uploadedFiles.filter(f => f.status === 'processing' || f.status === 'uploading').length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Zone */}
      <DragDropZone onDrop={handleFileDrop} isUploading={isUploading} />
      
      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Uploaded Files</h3>
            <div className="flex items-center gap-4 text-sm">
              {processingCount > 0 && (
                <span className="text-yellow-400">Processing: {processingCount}</span>
              )}
              <span className="text-green-400">Indexed: {indexedCount}</span>
            </div>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {uploadedFiles.map(file => (
                <FileItem
                  key={file.id}
                  file={file}
                  onRemove={onRemoveFile}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      
      {/* Index Status */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-white/[0.02] rounded-lg border border-white/[0.05]"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Index Status</span>
          </div>
          <p className="text-xs text-white/60">
            {indexedCount} of {uploadedFiles.length} files indexed and ready for search
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default FileUpload;
