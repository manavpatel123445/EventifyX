import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { CheckCircle, X } from 'lucide-react';

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const handleScan = (result: string | null) => {
    if (result) {
      setResult(result);
      setIsScanning(false);
      onScan(result);
    }
  };

  const handleError = (err: any) => {
    console.error('QR Scanner Error:', err);
    setError('Failed to access camera. Please check permissions.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Scan QR Code</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {error ? (
          <div className="text-red-500 p-4 bg-red-50 rounded">
            {error}
          </div>
        ) : (
          <div className="relative">
            {isScanning ? (
              <div className="border-4 border-primary rounded-lg overflow-hidden">
                <Scanner
                  onDecode={(result: string | null) => handleScan(result)}
                  onError={(error: any) => handleError(error)}
                  constraints={{ facingMode: 'environment' }}
                  containerStyle={{ width: '100%' }}
                  videoStyle={{ width: '100%' }}
                />
              </div>
            ) : (
              <div className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">Ticket Scanned Successfully!</p>
                <button
                  onClick={() => {
                    setResult(null);
                    setIsScanning(true);
                  }}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                  Scan Another
                </button>
              </div>
            )}
          </div>
        )}
        
        {result && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm break-all">
            <p className="font-medium mb-1">Scanned Data:</p>
            <code>{result}</code>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;
