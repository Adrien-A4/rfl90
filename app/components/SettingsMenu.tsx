"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Settings,
  Sun,
  Moon,
  Globe,
  ChevronRight,
  Check,
  DollarSign,
  Ruler,
  Percent,
  Thermometer,
  LogIn,
  LogOut,
  User,
} from "lucide-react";

import { useToast } from "@/components/ui/sonner";

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
];

const currencies = [
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "Dollar" },
  { code: "GBP", symbol: "£", name: "Pound" },
];

const units = [
  { code: "metric", name: "Metric (cm)" },
  { code: "imperial", name: "Imperial (ft)" },
];

const oddsFormats = [
  { format: "decimal", name: "Decimal (3.50)" },
  { format: "fractional", name: "Fractional (5/2)" },
  { format: "american", name: "American (+250)" },
];

type DiscordUser = {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
};

export default function SettingsMenu() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("EUR");
  const [unit, setUnit] = useState("metric");
  const [oddsFormat, setOddsFormat] = useState("decimal");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const languageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const storedTheme =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (storedTheme === "light") setTheme("light");
    else setTheme("dark");

    const storedDir =
      typeof window !== "undefined" ? localStorage.getItem("dir") : null;
    if (storedDir === "rtl") {
      setDir("rtl");
      setLanguage("ar");
    } else {
      setDir("ltr");
      setLanguage("en");
    }

    const storedCurrency =
      typeof window !== "undefined" ? localStorage.getItem("currency") : null;
    if (storedCurrency) setCurrency(storedCurrency);

    const storedUnit =
      typeof window !== "undefined" ? localStorage.getItem("unit") : null;
    if (storedUnit) setUnit(storedUnit);

    const storedOdds =
      typeof window !== "undefined" ? localStorage.getItem("oddsFormat") : null;
    if (storedOdds) setOddsFormat(storedOdds);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      document.documentElement.style.setProperty("color-scheme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = dir;
      localStorage.setItem("dir", dir);
    }
  }, [dir]);

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem("unit", unit);
  }, [unit]);

  useEffect(() => {
    localStorage.setItem("oddsFormat", oddsFormat);
  }, [oddsFormat]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (e.target instanceof Node && !menuRef.current.contains(e.target))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLanguageChange = (lang: string) => {
    if (lang !== "en") {
      toast({
        title: "Coming Soon",
        description: "Translation is coming soon!",
        variant: "default",
      });
      return;
    }
    setLanguage(lang);
    setLanguageOpen(false);
    setDir("ltr");
  };

  const handleLogout = () => {
    document.cookie =
      "discord_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setOpen(false);
    router.refresh();
  };

  const getAvatarUrl = (userId: string, avatarHash: string | null) => {
    if (!avatarHash) {
      return `https://cdn.discordapp.com/embed/avatars/${parseInt(userId) % 5}.png`;
    }
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=64`;
  };

  const Item = ({
    icon,
    children,
    onClick,
    active,
  }: {
    icon: React.ReactNode;
    children: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
  }) => {
    const handleClick = () => {
      onClick?.();
      setOpen(false);
    };

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
          active
            ? "bg-white/10 text-white"
            : "text-white/60 hover:text-white hover:bg-white/5"
        }`}
      >
        <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
        <span className="flex-1 text-sm">{children}</span>
        {active && <Check className="w-4 h-4 text-white/60" />}
      </motion.button>
    );
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Settings className="w-5 h-5 text-white/60" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute ${
              dir === "rtl" ? "left-0" : "right-0"
            } mt-2 w-64 bg-[#1a1a1a] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] border border-white/6 z-50 p-2`}
          >
            <div className="mb-2 border-b border-white/6 pb-2 px-1">
              <div className="text-xs text-white/40 mb-2 px-2">Account</div>
              {loading ? (
                <div className="w-full flex items-center gap-3 px-3 py-2">
                  <div className="w-5 h-5 animate-pulse bg-white/10 rounded-full" />
                  <div className="flex-1 h-4 animate-pulse bg-white/10 rounded" />
                </div>
              ) : user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0">
                      <Image
                        src={getAvatarUrl(user.id, user.avatar)}
                        alt={user.username}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {user.username}
                      </div>
                      <div className="text-xs text-white/40">
                        #{user.discriminator}
                      </div>
                    </div>
                  </div>
                  <Item
                    onClick={handleLogout}
                    icon={<LogOut className="w-4 h-4" />}
                  >
                    Sign out
                  </Item>
                </div>
              ) : (
                <Item
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => router.replace("/login"), 300);
                  }}
                  icon={<LogIn className="w-4 h-4" />}
                >
                  Sign in
                </Item>
              )}
            </div>
            <div className="mb-2 border-b border-white/6 pb-2 px-1">
              <div className="text-xs text-white/40 mb-2 px-2">Theme</div>
              <button
                onClick={() =>
                  setTheme((t) => (t === "dark" ? "light" : "dark"))
                }
                className={`w-full flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg p-1 transition-all duration-300 ${
                  theme === "light" ? "bg-white/10" : ""
                }`}
                aria-pressed={theme === "light"}
              >
                <motion.div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                    theme === "dark" ? "bg-white/10" : ""
                  }`}
                  animate={{ opacity: theme === "dark" ? 1 : 0.6 }}
                >
                  <Moon
                    className={`w-4 h-4 transition-colors duration-300 ${
                      theme === "dark" ? "text-blue-300" : "text-white/40"
                    }`}
                  />
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      theme === "dark" ? "text-white" : "text-white/60"
                    }`}
                  >
                    Dark
                  </span>
                </motion.div>
                <motion.div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                    theme === "light" ? "bg-white/10" : ""
                  }`}
                  animate={{ opacity: theme === "light" ? 1 : 0.6 }}
                >
                  <Sun
                    className={`w-4 h-4 transition-colors duration-300 ${
                      theme === "light" ? "text-yellow-400" : "text-white/40"
                    }`}
                  />
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      theme === "light" ? "text-white" : "text-white/60"
                    }`}
                  >
                    Light
                  </span>
                </motion.div>
              </button>
            </div>
            <div
              className="relative mb-2 border-b border-white/6 pb-2 px-1"
              ref={languageRef}
              onMouseEnter={() => setLanguageOpen(true)}
              onMouseLeave={() => setLanguageOpen(false)}
            >
              <div className="text-xs text-white/40 mb-2 px-2">Language</div>
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-white/40" />
                  <span className="text-sm text-white/80">
                    {languages.find((l) => l.code === language)?.nativeName}
                  </span>
                </div>
                <motion.div
                  animate={{
                    rotate: languageOpen ? 90 : 0,
                    scaleX: dir === "rtl" ? -1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </motion.div>
              </button>

              <AnimatePresence>
                {languageOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: dir === "rtl" ? 8 : -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir === "rtl" ? 8 : -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={`absolute ${
                      dir === "rtl" ? "left-full" : "right-full"
                    } ${
                      dir === "rtl" ? "ml-0 mr-2" : "ml-2"
                    } top-0 w-40 bg-[#1a1a1a] rounded-lg shadow-lg border border-white/6 z-50 py-1`}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full flex items-center justify-between px-3 py-2 transition-all duration-200 ${
                          language === lang.code
                            ? "bg-white/10 text-white"
                            : "text-white/80 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="text-sm">{lang.nativeName}</span>
                        {language === lang.code && (
                          <Check className="w-4 h-4 text-white/60" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="px-1">
              <div className="text-xs text-white/40 mb-2 px-2">Preferences</div>
              <div className="space-y-1">
                <Item
                  icon={<DollarSign className="w-4 h-4" />}
                  active={currency === "EUR"}
                >
                  Euro (EUR)
                </Item>
                <Item
                  icon={<Ruler className="w-4 h-4" />}
                  active={unit === "metric"}
                >
                  Metric (cm)
                </Item>
                <Item
                  icon={<Percent className="w-4 h-4" />}
                  active={oddsFormat === "decimal"}
                >
                  Odds format - 3.50
                </Item>
                <Item icon={<Thermometer className="w-4 h-4" />} active={true}>
                  Celsius (°C)
                </Item>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
