import * as React from "react";

export function ShareBarList({ children }: { children: React.ReactNode }) {
  return <div className="w-full space-y-2 px-4 py-2">{children}</div>;
}

export function ShareBarListItem({ children, value, key }: { children: React.ReactNode; value: number; key?: React.Key }) {
  return <div className="space-y-1">{children}</div>;
}

export function ShareBarListContent({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-between text-xs font-medium text-slate-700">{children}</div>;
}

export function ShareBarListLabel({ children }: { children: React.ReactNode }) {
  return <span>{children}</span>;
}

export function ShareBarListValue({ children }: { children: React.ReactNode }) {
  return <span>{children}</span>;
}

export function ShareBarListFill({ 'data-online-bar': isOnlineBar }: { 'data-online-bar'?: boolean }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full bg-slate-900 rounded-full" style={{ width: "60%" }} />
    </div>
  );
}
