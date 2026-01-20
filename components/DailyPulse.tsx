import { Play } from "lucide-react";

export default function DailyPulse() {
  return (
    <div className="flex items-center gap-4 bg-[#F7EFFD] rounded-full p-2 pr-6">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
        <Play className="w-4 h-4 fill-current ml-0.5" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-900 leading-tight">
          Daily Pulse
        </span>
        <span className="text-xs text-gray-500 leading-tight">
          Complete all for +2 Pt each
        </span>
      </div>
    </div>
  );
}
