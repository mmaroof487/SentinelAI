import { CommandBriefing } from "@/components/intelligence/CommandBriefing";
import { ActionPlanAgent } from "@/components/intelligence/ActionPlanAgent";

export default function IntelligencePage() {
  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      <div className="flex items-center gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Intelligence Console</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Command briefings · Operational action plans · Resource intelligence
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="h-full overflow-y-auto pr-2">
          <CommandBriefing />
        </div>
        <div className="h-full overflow-y-auto pr-2">
          <ActionPlanAgent />
        </div>
      </div>
    </div>
  );
}
