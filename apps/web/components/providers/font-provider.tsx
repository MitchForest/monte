"use client";

import { useEffect } from "react";

const FONT_LINK_ID = "monte-dynapuff-font";
const FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=DynaPuff:wght@400;500;600;700&display=swap";

export function FontProvider() {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    if (document.getElementById(FONT_LINK_ID)) {
      return;
    }
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href = FONT_STYLESHEET;
    document.head.appendChild(link);

    return () => {
      // Preserve the stylesheet to avoid flashes when navigating back
    };
  }, []);

  return null;
}
