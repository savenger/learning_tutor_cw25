import React, { useState } from 'react';
import Container from '../components/Container';
import Button from '../components/Button';
import { processDocument } from '../api/api';
import { FaUpload, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const DocumentImporterPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadStatus('idle');
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }

    setUploadStatus('uploading');
    setMessage('Processing document...');

    // The backend endpoint is a placeholder and doesn't actually process files yet.
    // We'll simulate a successful or failed response.
    const response = await processDocument(selectedFile);

    if (response.data) {
      setUploadStatus('success');
      setMessage(response.data.message || 'Document processed successfully!');
      setSelectedFile(null); // Clear selected file on success
    } else if (response.error) {
      setUploadStatus('error');
      setMessage(response.error || 'Failed to process document.');
    }
  };

  return (
    <Container>
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Import Document to Create Flashcards
      </h1>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <p className="text-gray-700 mb-6 text-center">
          Upload a document (e.g., PDF, text file) and we'll help you generate flashcards from its content.
          <br />
          <span className="text-sm text-gray-500">
            (Note: This feature is currently a placeholder. The backend processing is under development.)
          </span>
        </p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-blue-400 transition duration-300">
          <input
            type="file"
            id="document-upload"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.txt,.doc,.docx"
          />
          <label
            htmlFor="document-upload"
            className="cursor-pointer text-blue-600 hover:text-blue-800 font-semibold flex flex-col items-center justify-center"
          >
            <FaUpload className="text-5xl mb-4 text-gray-400" />
            <span className="text-lg">
              {selectedFile ? selectedFile.name : 'Drag & Drop your file here, or click to browse'}
            </span>
            {selectedFile && (
              <span className="text-sm text-gray-500 mt-2">
                File selected: {selectedFile.name}
              </span>
            )}
          </label>
        </div>

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploadStatus === 'uploading'}
          className="w-full flex items-center justify-center"
        >
          {uploadStatus === 'uploading' ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <FaUpload className="mr-2" /> Upload Document
            </>
          )}
        </Button>

        {message && (
          <div
            className={`mt-6 p-4 rounded-lg flex items-center ${
              uploadStatus === 'success'
                ? 'bg-green-100 text-green-800'
                : uploadStatus === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {uploadStatus === 'success' && <FaCheckCircle className="mr-3 text-xl" />}
            {uploadStatus === 'error' && <FaTimesCircle className="mr-3 text-xl" />}
            <p>{message}</p>
          </div>
        )}
      </div>
    </Container>
  );
};

export default DocumentImporterPage;
