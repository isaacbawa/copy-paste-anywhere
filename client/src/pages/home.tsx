import ClipboardTool from "@/components/clipboard-tool";
import Footer from "@/components/footer";
import PromoBanner from "@/components/nonintrusiveAds/promobanner";



// I don't know why you would need to import StrategicAd, but it seems like a placeholder for future use.

export default function Home() {
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

        <ClipboardTool />

        <PromoBanner />

        {/* Strategic Ad Placement 1
        <StrategicAd
          title="Strategic Product Showcase Area #1"
          subtitle="Non-intrusive promotional content placeholder"
        /> */}

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="material-icons text-primary">security</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Private & Secure</h3>
            <p className="text-gray-600 text-sm">Strong dynamic links that are impossible to guess. Your data expires automatically.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="material-icons text-green-500">flash_on</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600 text-sm">Generate links instantly. No signup, no waiting. Just paste and share.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="material-icons text-orange-500">devices</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Universal Access</h3>
            <p className="text-gray-600 text-sm">Works on any device with a browser. Phone, tablet, computer - anywhere.</p>
          </div>
        </div>

        {/* Strategic Ad Placement 3
        <StrategicAd
          title="Strategic Product Showcase Area #3"
          subtitle="Bottom placement for additional offerings"
          className="mt-12"
        /> */}

      </main>

      {/* <Footer /> */}
    </div>
  );
}
