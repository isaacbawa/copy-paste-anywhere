import { Link } from "wouter";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col pb-5 min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in">
      <main className="flex-grow mt-3 flex items-center justify-center px-4">
        <Card className="w-full max-w-lg shadow-lg dark:bg-gray-800 animate-fade-in">
          <CardContent className="pt-6">
            {/* Animated Visual */}
            <div className="flex justify-center mb-6">
              <img
                src="https://images.unsplash.com/photo-1589652717521-10c0d092dea9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Page not found"

              />
            </div>

            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                404 - Page Not Found
              </h1>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              Sorry, the page you're looking for doesn't exist or has been moved. Please check the URL or return to the home page.
            </p>

            {/* Search Form */}
            {/* <div className="mt-6">
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
                <Input
                  placeholder="Search site..."
                  className="flex-1"
                />
                <Button type="submit" variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div> */}

            {/* Navigation */}
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="inline-block text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Go back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
