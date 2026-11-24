import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "HandiLearn | Learning that adapts to you", template: "%s | HandiLearn" },
  description: "A curriculum-guided adaptive learning partner for primary and secondary students in Barbados and the Caribbean.",
  applicationName: "HandiLearn",
};
export const viewport: Viewport = { themeColor: "#fbfaf6" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en-BB"><body>{children}</body></html>;
}
