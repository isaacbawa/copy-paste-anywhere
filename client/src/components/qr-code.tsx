import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRCodeLib from "qrcode";

interface QRCodeProps {
  text: string;
  size?: number;
}

export default function QRCode({ text, size = 200 }: QRCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const dataUrl = await QRCodeLib.toDataURL(text, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    if (text) {
      generateQRCode();
    }
  }, [text, size]);

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = 'clipboard-qr-code.png';
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareQRCode = async () => {
    if (!qrCodeDataUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'clipboard-qr-code.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Clipboard QR Code',
          text: 'Scan this QR code to access the shared text',
          files: [file]
        });
      } else {
        // Fallback: copy to clipboard
        if (navigator.clipboard && 'write' in navigator.clipboard) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          // Show success message if needed
        } else {
          // Final fallback: download
          downloadQRCode();
        }
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      // Fallback to download
      downloadQRCode();
    }
  };

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
            {qrCodeDataUrl ? (
              <img 
                src={qrCodeDataUrl} 
                alt="QR Code" 
                className="w-48 h-48"
                id="qr-code-image"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <span className="material-icons text-2xl mb-2 block">qr_code</span>
                  <p className="text-xs">Generating QR Code...</p>
                </div>
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-600 text-center max-w-xs">
            Scan this QR code with your phone to open the link
          </p>

          {/* Action Buttons */}
          {qrCodeDataUrl && (
            <div className="flex gap-2 w-full">
              <Button
                onClick={downloadQRCode}
                variant="outline"
                className="flex-1 text-sm py-2"
              >
                <span className="material-icons text-sm mr-1">download</span>
                Download
              </Button>
              <Button
                onClick={shareQRCode}
                variant="outline"
                className="flex-1 text-sm py-2"
              >
                <span className="material-icons text-sm mr-1">share</span>
                Share
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}