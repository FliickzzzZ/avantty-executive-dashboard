import * as React from "react";
import { Sparkles } from "lucide-react";

export function LatestChange() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
      <div className="flex items-center gap-1.5 font-bold text-slate-900">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        <span>Latest Update</span>
      </div>
      <p className="text-[11px] text-slate-500">
        Candidate Search with Company Profile & Languages.
      </p>
    </div>
  );
}
