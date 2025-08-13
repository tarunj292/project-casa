// src/components/ImportProductsModal.tsx

import React, { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useBrand } from '../contexts/BrandContext'; // Import the BrandContext
import axios from 'axios';

interface ImportProductsModalProps {
  onClose: () => void;
  onImportSuccess: (message: string) => void;
}

const ImportProductsModal: React.FC<ImportProductsModalProps> = ({ onClose, onImportSuccess }) => {
  const { brand } = useBrand(); // Use the BrandContext to get the current brand
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'xlsx' || fileExtension === 'xls' || fileExtension === 'csv') {
        setSelectedFile(file);
        setMessage('');
        setIsError(false);
      } else {
        setSelectedFile(null);
        setMessage('Invalid file type. Please upload a .xlsx, .xls, or .csv file.');
        setIsError(true);
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setMessage('Please select a file to import.');
      setIsError(true);
      return;
    }
    if (!brand?._id) {
      setMessage('Brand information is missing. Cannot import products.');
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setMessage('Importing products... This may take a moment.');
    setIsError(false);

    const formData = new FormData();
    formData.append('file', selectedFile);
    // Add the brandId to the form data for a more robust import
    formData.append('brandId', brand._id);


    try {
      const response = await axios.post('http://localhost:5002/api/products/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onImportSuccess(response.data.message || 'Products imported successfully.');
      onClose();
    } catch (error) {
      console.error('Import failed:', error);
      setIsError(true);
      if (axios.isAxiosError(error) && error.response) {
        setMessage(error.response.data.message || 'An unexpected error occurred.');
      } else {
        setMessage('Network error or server is unavailable.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fileLabelText = selectedFile ? selectedFile.name : 'Choose file...';

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Import Products from Excel</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Upload a `.xlsx`, `.xls`, or `.csv` file to add multiple products at once.
          </p>
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select File
            </label>
            <label className={`block w-full py-4 px-6 bg-slate-50 border-2 rounded-2xl cursor-pointer transition-colors ${
                isError ? 'border-red-400' : 'border-slate-200 hover:border-blue-400'
            }`}>
              <span className="text-slate-500 truncate">{fileLabelText}</span>
              <input
                type="file"
                className="hidden"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
              />
            </label>
            <p className="text-xs text-slate-400 mt-2">
              Please ensure your file has columns for: `name`, `price`, `category`, `brand`, `stock`, `gender`.
            </p>
          </div>

          {message && (
            <div className={`flex items-center space-x-2 p-3 rounded-2xl ${isError ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              {isError ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
              <span className="text-sm">{message}</span>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={handleImport}
              disabled={!selectedFile || isLoading || !brand?._id}
              className={`flex-1 py-4 px-6 rounded-2xl text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader size={20} className="animate-spin mr-2" />
                  Importing...
                </span>
              ) : (
                'Import'
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportProductsModal;