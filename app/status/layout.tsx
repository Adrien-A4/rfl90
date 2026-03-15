import { Metadata } from "next";
import "@/app/globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="min-h-screen bg-background">{children}</div>
    </>
  );
}

export const metadata: Metadata = {
  title: "Status - Real Futbol Fantasy",
  description: "Real Futbol Fantasy system status and health checks",
};
