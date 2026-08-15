import * as React from "react";
import { Users } from "lucide-react";

export function LogoIcon({ className = "h-5 w-5" }: { className?: string }) {
  return <Users className={className} />;
}

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white font-bold">
        <Users className="h-4 w-4" />
      </div>
      <span className="font-bold text-slate-900 text-sm">Avantty demo</span>
    </div>
  );
}
