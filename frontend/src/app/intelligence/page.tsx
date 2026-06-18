import { CommandBriefing } from "@/components/intelligence/CommandBriefing";
import { ActionPlanAgent } from "@/components/intelligence/ActionPlanAgent";

export default function IntelligencePage() {
  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-6rem)]">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Intelligence Console</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Command briefings · Operational action plans · Resource intelligence
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        <div className="h-[calc(100vh-10rem)]">
          <CommandBriefing />
        </div>
        <div className="h-[calc(100vh-10rem)]">
          <ActionPlanAgent />
        </div>
      </div>
    </div>
  );
}
