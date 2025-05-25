import { Button } from "@/components/ui/button";

export default function ErrorView() {
  const goToCreate = () => {
    window.location.href = "/";
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="text-primary">Copy</span>and<span className="text-primary">Paste</span>Anywhere
          </h1>
          <p className="text-sm text-gray-600 mt-1">Universal clipboard for instant text sharing</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-red-500 text-2xl">error_outline</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Clip Not Found</h2>
            <p className="text-gray-600 max-w-md mx-auto">This clip has either expired, been revoked by the creator, or the link is invalid.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-3">What you can do:</h3>
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">• Contact the sender to create a new clip</p>
              <p className="text-gray-600 text-sm">• Create your own clip to share text</p>
            </div>
            
            <Button 
              onClick={goToCreate}
              className="mt-4 bg-primary hover:bg-blue-700 text-white py-3 px-6 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <span className="material-icons text-sm">add</span>
              Create New Clip
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-primary transition-colors">How it Works</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-left max-w-2xl mx-auto">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="material-icons text-sm">shield</span>
                Privacy & Security
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                CopyandPasteAnywhere respects your privacy. We don't store personal information, track users, or keep your text longer than necessary. 
                All clips are temporary and automatically deleted after expiry. Links use strong random generation for security.
              </p>
            </div>
            
            <p className="text-xs text-gray-500">
              © 2024 CopyandPasteAnywhere. Built for simple, secure text sharing across devices.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
