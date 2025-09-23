import React, { useState } from 'react';
import { QRCodeScanner } from '../components/QRCodeScanner';
import { Button } from '../components/ui/button';
import { Scan, X } from 'lucide-react';

const ScanTicketsPage: React.FC = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleScan = (data: string) => {
    try {
      const ticketData = JSON.parse(data);
      setScanResult({
        ...ticketData,
        scanTime: new Date().toLocaleString(),
        isValid: true // In a real app, you'd validate this against your backend
      });
    } catch (error) {
      console.error('Invalid QR Code:', error);
      setScanResult({
        error: 'Invalid ticket format',
        rawData: data,
        scanTime: new Date().toLocaleString()
      });
    }
  };

  const validateTicket = async () => {
    // In a real app, you would send this to your backend for validation
    try {
      // Example API call:
      // const response = await fetch('/api/tickets/validate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ticketId: scanResult.ticketId })
      // });
      // const data = await response.json();
      
      // For now, we'll just show a success message
      alert('Ticket is valid!');
    } catch (error) {
      console.error('Validation error:', error);
      alert('Error validating ticket. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ticket Scanner</h1>
        <Button 
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center gap-2"
        >
          <Scan className="w-4 h-4" />
          Scan Ticket
        </Button>
      </div>

      {!isScannerOpen && !scanResult && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Scan className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-2">Ready to scan tickets</h2>
          <p className="text-gray-600 mb-6">Click the button above to start scanning tickets</p>
        </div>
      )}

      {isScannerOpen && (
        <QRCodeScanner 
          onScan={handleScan} 
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {scanResult && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {scanResult.error ? 'Scan Result' : 'Ticket Information'}
          </h2>
          
          {scanResult.error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{scanResult.error}</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                <p className="font-medium">Raw Data:</p>
                <code className="break-all">{scanResult.rawData}</code>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ticket ID</p>
                  <p className="font-medium">{scanResult.ticketId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{(scanResult.type || 'GENERAL').toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Event ID</p>
                  <p className="font-medium">{scanResult.eventId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Scanned At</p>
                  <p className="font-medium">{scanResult.scanTime}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t mt-4">
                <Button 
                  onClick={validateTicket}
                  className="w-full md:w-auto"
                >
                  Validate Ticket
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanTicketsPage;
