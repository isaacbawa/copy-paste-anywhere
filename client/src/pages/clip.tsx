import { useParams } from "wouter";
import ClipViewer from "@/components/clip-viewer";
import ErrorView from "@/components/error-view";
import { useQuery } from "@tanstack/react-query";

export default function ClipPage() {
  const { id } = useParams<{ id: string }>();

  const { data: clip, isLoading, error } = useQuery({
    queryKey: ["/api/clips", id],
    queryFn: async () => {
      const response = await fetch(`/api/clips/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch clip");
      }
      return response.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !clip || !clip.success) {
    return <ErrorView />;
  }

  return <ClipViewer clip={clip} />;
}
