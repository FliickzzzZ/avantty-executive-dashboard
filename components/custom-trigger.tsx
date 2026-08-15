import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function CustomTrigger({ place }: { place?: "navbar" | "sidebar" }) {
  return <SidebarTrigger className={place === "navbar" ? "h-8 w-8" : ""} />;
}
