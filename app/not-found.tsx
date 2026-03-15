import Link from "next/link";
import { Home, RefreshCcw } from "lucide-react";
import Image from "next/image";

export default function SharedProfileNotFound() {
  return (
    <div className="relative min-h-screen bg-[#222222] px-6 py-10">
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl border border-[#111111] bg-[#222222] p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.6)]">
        <p className="text-4xl font-semibold tracking-wide text-white">
          404 - Not Found
        </p>

        <Image
          src="/rff.png"
          alt="Real Futbol Fantasy"
          width={500}
          height={500}
          draggable={false}
        />

        <h1 className="mt-2 text-2xl font-bold text-[#e9ffe9]">
          Page not found
        </h1>

        <p className="mt-2 text-sm text-[#a6c8aa]">
          Would you like to go somewhere else?
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="https://rff.giize.com/"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#333333] bg-[#111111] px-4 text-sm font-semibold text-[#c9efcf] transition-all duration-150 hover:bg-[#1b1b1b] hover:border-[#555555]"
          >
            <Home className="size-4" />
            Go Home
          </Link>

          <Link
            href="https://fantasy.rff.giize.com/"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#333333] bg-[#111111] px-4 text-sm font-semibold text-[#c9efcf] transition-all duration-150 hover:bg-[#1b1b1b] hover:border-[#555555]"
          >
            <RefreshCcw className="size-4" />
            Open Fantasy
          </Link>
        </div>
      </main>
    </div>
  );
}
