import { DailyBriefing } from "@/components/intelligence/DailyBriefing";
import { ChatConsole } from "@/components/intelligence/ChatConsole";

export default function IntelligencePage() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)]">
      <div className="w-full lg:w-1/3 h-full flex flex-col">
        <DailyBriefing />
      </div>
      <div className="w-full lg:w-2/3 h-full flex flex-col">
        <ChatConsole />
      </div>
    </div>
  );
}
