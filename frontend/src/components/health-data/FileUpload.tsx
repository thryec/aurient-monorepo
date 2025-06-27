"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Upload,
  File,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { UploadedFile } from "@/lib/types";

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  uploadedFiles: UploadedFile[];
}

// Only use Pinata gateway
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY;

console.log("NEXT_PUBLIC_PINATA_GATEWAY", PINATA_GATEWAY);

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  uploadedFiles,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Copy CID to clipboard with feedback
  const [copiedCid, setCopiedCid] = useState<string | null>(null);
  const handleCopyCid = async (cid: string) => {
    await navigator.clipboard.writeText(cid);
    setCopiedCid(cid);
    setTimeout(() => setCopiedCid(null), 1500);
  };

  const allowedTypes = [
    "application/pdf",
    "application/json",
    "text/csv",
    "text/plain",
  ];

  const allowedExtensions = [".pdf", ".json", ".csv", ".txt"];

  const validateFile = (file: File): string | null => {
    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    ) {
      return "File type not supported. Please upload PDF, JSON, or CSV files.";
    }

    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      return "File size too large. Maximum size is 50MB.";
    }

    return null;
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    // Use FormData and POST to /api/files (your Pinata API route)
    const data = new FormData();
    data.set("file", file);
    const uploadRequest = await fetch("/api/pinata", {
      method: "POST",
      body: data,
    });
    const result = await uploadRequest.json();
    console.log("result", result);
    if (!result || !result.cid) throw new Error("Upload failed");
    return result.cid;
  };

  const handleFileUpload = async (files: FileList) => {
    const newFiles: UploadedFile[] = [];

    for (const file of Array.from(files)) {
      const error = validateFile(file);
      if (error) {
        newFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadStatus: "error",
          error,
        });
        continue;
      }

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadStatus: "pending",
      };

      newFiles.push(uploadedFile);
      setUploadingFiles((prev) => new Set(prev).add(uploadedFile.id));

      try {
        uploadedFile.uploadStatus = "uploading";
        const ipfsHash = await uploadToIPFS(file);
        uploadedFile.ipfsHash = ipfsHash;
        uploadedFile.uploadStatus = "success";
      } catch (error) {
        uploadedFile.uploadStatus = "error";
        uploadedFile.error = "Upload failed. Please try again.";
      } finally {
        setUploadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(uploadedFile.id);
          return newSet;
        });
      }
    }

    onFilesUploaded([...uploadedFiles, ...newFiles]);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [uploadedFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter((file) => file.id !== fileId);
    onFilesUploaded(updatedFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string, name: string) => {
    if (type === "application/pdf" || name.toLowerCase().endsWith(".pdf")) {
      return "📄";
    } else if (
      type === "application/json" ||
      name.toLowerCase().endsWith(".json")
    ) {
      return "📋";
    } else if (type === "text/csv" || name.toLowerCase().endsWith(".csv")) {
      return "📊";
    }
    return "📁";
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
          ${
            isDragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload Health Data Files
        </h3>
        <p className="text-gray-600 mb-4">
          Drag and drop your files here, or click to browse
        </p>
        <p className="text-sm text-gray-500">
          Supported formats: PDF, JSON, CSV (Max 50MB per file)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.json,.csv,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Uploaded Files</h4>
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {getFileIcon(file.type, file.name)}
                </span>
                <div>
                  <p className="font-medium text-gray-900">
                    {file.ipfsHash ? (
                      <a
                        href={`https://${PINATA_GATEWAY}/ipfs/${file.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-blue-700"
                      >
                        {file.name}
                      </a>
                    ) : (
                      file.name
                    )}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    {formatFileSize(file.size)}
                    {file.ipfsHash && (
                      <div className="mt-1 flex flex-col gap-1">
                        <div className="flex gap-3">
                          <a
                            href={`https://${PINATA_GATEWAY}/ipfs/${file.ipfsHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:underline text-xs font-medium"
                          >
                            View on Pinata Gateway
                          </a>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded select-all">
                            {file.ipfsHash}
                          </span>
                          <button
                            onClick={() => handleCopyCid(file.ipfsHash!)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Copy CID"
                          >
                            {copiedCid === file.ipfsHash ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {uploadingFiles.has(file.id) && (
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                )}

                {file.uploadStatus === "success" && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}

                {file.uploadStatus === "error" && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}

                <button
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {uploadedFiles.some((file) => file.uploadStatus === "error") && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">Upload Errors</h4>
          {uploadedFiles
            .filter((file) => file.uploadStatus === "error")
            .map((file) => (
              <p key={file.id} className="text-sm text-red-700">
                {file.name}: {file.error}
              </p>
            ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
