import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface QRCodeProps {
  text: string;
  size?: number;
}

export default function QRCode({ text, size = 200 }: QRCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Generate QR code using Google Charts API (free, no API key required)
  const qrCodeUrl = `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodeURIComponent(text)}&choe=UTF-8`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-300"
        >
          <span className="material-icons text-sm">qr_code</span>
          <span className="hidden sm:inline">QR Code</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 p-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="w-48 h-48"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <span className="material-icons text-2xl mb-2 block">error_outline</span>
                <p className="text-xs">QR Code unavailable</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center max-w-xs">
            Scan this QR code with your phone to open the link
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}