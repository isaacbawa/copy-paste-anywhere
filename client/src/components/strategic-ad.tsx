import { cn } from "@/lib/utils";

interface StrategicAdProps {
  title: string;
  subtitle: string;
  className?: string;
}

export default function StrategicAd({ title, subtitle, className }: StrategicAdProps) {
  return (
    <div className={cn("bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center", className)}>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-gray-400 text-xs mt-1">{subtitle}</p>
    </div>
  );
}
