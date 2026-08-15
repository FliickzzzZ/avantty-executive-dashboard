import { useEffect } from "react";

let activeLocksCount = 0;

export function useLockBodyScroll(isLocked: boolean = true) {
  useEffect(() => {
    if (!isLocked) return;

    activeLocksCount++;
    if (activeLocksCount === 1) {
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
      document.documentElement.style.overscrollBehavior = "none";
    }

    return () => {
      activeLocksCount = Math.max(0, activeLocksCount - 1);
      if (activeLocksCount === 0) {
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        document.body.style.overscrollBehavior = "";
        document.documentElement.style.overscrollBehavior = "";
      }
    };
  }, [isLocked]);
}
