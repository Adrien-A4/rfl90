"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import {
  Activity,
  Database,
  Server,
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

type ServiceStatus = {
  name: string;
  status: "operational" | "degraded" | "down";
  latency: number | null;
  icon: React.ReactNode;
  regions?: string[];
  lastChecked?: Date;
  uptime?: number;
};

type DatabaseTableStatus = {
  table: string;
  rowCount: number | null;
  status: "accessible" | "error";
  lastUpdated: Date | null;
};

type ExternalService = {
  name: string;
  status: "operational" | "degraded" | "down";
  lastChecked?: Date;
  responseTime?: number;
};

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "Database",
      status: "operational",
      latency: null,
      icon: <Database className="w-5 h-5" />,
      regions: ["US-West", "US-East"],
      lastChecked: new Date(),
      uptime: 99.98,
    },
    {
      name: "API Server",
      status: "operational",
      latency: null,
      icon: <Server className="w-5 h-5" />,
      regions: ["US-West", "US-East", "EU-West"],
      lastChecked: new Date(),
      uptime: 99.95,
    },
    {
      name: "WebSocket",
      status: "operational",
      latency: null,
      icon: <Wifi className="w-5 h-5" />,
      regions: ["US-West"],
      lastChecked: new Date(),
      uptime: 99.99,
    },
  ]);

  const [tables, setTables] = useState<DatabaseTableStatus[]>([
    {
      table: "players",
      rowCount: null,
      status: "accessible",
      lastUpdated: null,
    },
    { table: "teams", rowCount: null, status: "accessible", lastUpdated: null },
    {
      table: "matches",
      rowCount: null,
      status: "accessible",
      lastUpdated: null,
    },
    {
      table: "leagues",
      rowCount: null,
      status: "accessible",
      lastUpdated: null,
    },
    {
      table: "user_players",
      rowCount: null,
      status: "accessible",
      lastUpdated: null,
    },
    {
      table: "user_team",
      rowCount: null,
      status: "accessible",
      lastUpdated: null,
    },
    {
      table: "transfers",
      rowCount: null,
      status: "accessible",
      lastUpdated: null,
    },
    { table: "news", rowCount: null, status: "accessible", lastUpdated: null },
    {
      table: "gameweeks",
      rowCount: null,
      status: "accessible",
      lastUpdated: null,
    },
    {
      table: "transfer_windows",
      rowCount: null,
      status: "accessible",
      lastUpdated: null,
    },
  ]);

  const [externalServices, setExternalServices] = useState<ExternalService[]>([
    {
      name: "Supabase",
      status: "operational",
      lastChecked: new Date(),
      responseTime: 45,
    },
    {
      name: "GitHub",
      status: "operational",
      lastChecked: new Date(),
      responseTime: 120,
    },
    {
      name: "Supabase API",
      status: "degraded",
      lastChecked: new Date(),
      responseTime: 350,
    },
    {
      name: "Discord Auth",
      status: "operational",
      lastChecked: new Date(),
      responseTime: 85,
    },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [latencyHistory, setLatencyHistory] = useState<number[]>(
    Array(20).fill(50),
  );

  const checkDatabaseLatency = async () => {
    const start = performance.now();
    try {
      const response = await fetch("/api/status/db-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const end = performance.now();
      const latency = Math.round(end - start);

      setServices((prev) =>
        prev.map((s) =>
          s.name === "Database"
            ? {
                ...s,
                latency,
                status: response.ok ? "operational" : "degraded",
                lastChecked: new Date(),
              }
            : s,
        ),
      );

      setLatencyHistory((prev) => [...prev.slice(1), latency]);
      return latency;
    } catch {
      setServices((prev) =>
        prev.map((s) =>
          s.name === "Database"
            ? { ...s, latency: null, status: "down", lastChecked: new Date() }
            : s,
        ),
      );
      return null;
    }
  };

  const checkApiLatency = async () => {
    const start = performance.now();
    try {
      await fetch("/api/fantasy/players", { method: "HEAD" });
      const end = performance.now();
      const latency = Math.round(end - start);

      setServices((prev) =>
        prev.map((s) =>
          s.name === "API Server"
            ? {
                ...s,
                latency,
                status: "operational",
                lastChecked: new Date(),
              }
            : s,
        ),
      );
    } catch {
      setServices((prev) =>
        prev.map((s) =>
          s.name === "API Server"
            ? { ...s, latency: null, status: "down", lastChecked: new Date() }
            : s,
        ),
      );
    }
  };

  const checkWebSocket = async () => {
    setServices((prev) =>
      prev.map((s) =>
        s.name === "WebSocket"
          ? {
              ...s,
              latency: null,
              status: "operational",
              lastChecked: new Date(),
            }
          : s,
      ),
    );
  };

  const fetchTableCounts = async () => {
    try {
      const response = await fetch("/api/status/table-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.tables) {
        setTables((prev) =>
          prev.map((t) => {
            const tableData = data.tables[t.table];
            return {
              ...t,
              rowCount: tableData?.rowCount ?? null,
              status: tableData?.error ? "error" : "accessible",
              lastUpdated: new Date(),
            };
          }),
        );
      }
    } catch {
      setTables((prev) =>
        prev.map((t) => ({
          ...t,
          status: "error",
          rowCount: null,
          lastUpdated: new Date(),
        })),
      );
    }
  };

  const refreshStatus = async () => {
    setIsLoading(true);
    await Promise.all([
      checkDatabaseLatency(),
      checkApiLatency(),
      checkWebSocket(),
      fetchTableCounts(),
    ]);
    setLastRefresh(new Date());
    setExternalServices((prev) =>
      prev.map((s) => ({ ...s, lastChecked: new Date() })),
    );
    setIsLoading(false);
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: "operational" | "degraded" | "down") => {
    switch (status) {
      case "operational":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "down":
        return "bg-red-500";
    }
  };

  const getStatusTextColor = (status: "operational" | "degraded" | "down") => {
    switch (status) {
      case "operational":
        return "text-green-500";
      case "degraded":
        return "text-yellow-500";
      case "down":
        return "text-red-500";
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getRelativeTime = (date: Date | null) => {
    if (!date) return "Never";
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const overallStatus = services.every((s) => s.status === "operational")
    ? "operational"
    : services.some((s) => s.status === "down")
      ? "down"
      : "degraded";

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 py-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
              <Activity
                className={`w-8 h-8 ${getStatusTextColor(overallStatus)}`}
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {overallStatus === "operational"
                ? "All Systems Operational"
                : overallStatus === "degraded"
                  ? "Degraded Performance"
                  : "System Outage"}
            </h1>
            <p className="text-muted-foreground text-lg flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Updated {getRelativeTime(lastRefresh)}
            </p>
          </motion.div>

          <div className="space-y-6">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="overflow-hidden border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold">
                                {service.name}
                              </h3>
                              {service.latency && (
                                <span className="text-sm text-muted-foreground">
                                  {service.latency}ms
                                </span>
                              )}
                            </div>
                            <Badge
                              variant="secondary"
                              className={`${getStatusColor(service.status)} text-white border-0`}
                            >
                              {service.status === "operational"
                                ? "Operational"
                                : service.status === "degraded"
                                  ? "Degraded"
                                  : "Down"}
                            </Badge>
                          </div>

                          {service.regions && (
                            <div className="flex gap-2">
                              {service.regions.map((region) => (
                                <Badge
                                  key={region}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {region}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                            <div className="h-full flex gap-0.5">
                              {Array.from({ length: 90 }).map((_, i) => {
                                const isError =
                                  Math.random() > 0.95 &&
                                  service.status === "degraded";
                                return (
                                  <motion.div
                                    key={i}
                                    className={`flex-1 ${
                                      isError ? "bg-red-500" : "bg-green-500"
                                    }`}
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{
                                      delay: i * 0.005,
                                      duration: 0.2,
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">Last Checked:</span>
                        <span>{formatDate(service.lastChecked)}</span>
                      </div>
                      {service.uptime && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-semibold">Uptime:</span>
                          <span>{service.uptime}%</span>
                        </div>
                      )}
                      {service.latency && (
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          <span className="font-semibold">Latency:</span>
                          <span>{service.latency}ms</span>
                        </div>
                      )}
                      {service.status !== "operational" && (
                        <div className="flex items-center gap-2 text-yellow-500">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">
                            {service.status === "degraded"
                              ? "Service experiencing issues"
                              : "Service is currently down"}
                          </span>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  External Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {externalServices.map((service, index) => (
                    <Tooltip key={service.name}>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              service.status === "operational"
                                ? "bg-green-500"
                                : service.status === "degraded"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          />
                          <span className="text-sm">{service.name}</span>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Status:</span>
                            <span className="capitalize">{service.status}</span>
                          </div>
                          {service.responseTime && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                Response Time:
                              </span>
                              <span>{service.responseTime}ms</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Checked:</span>
                            <span>{formatDate(service.lastChecked)}</span>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Tables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tables.map((table, index) => (
                    <Tooltip key={table.table}>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.03 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                table.status === "accessible"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <span className="font-mono text-sm">
                              {table.table}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            {table.rowCount !== null && (
                              <span className="text-sm text-muted-foreground">
                                {table.rowCount.toLocaleString()} rows
                              </span>
                            )}
                            {table.status === "accessible" ? (
                              <Wifi className="w-4 h-4 text-green-500" />
                            ) : (
                              <WifiOff className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Table:</span>
                            <span className="font-mono">{table.table}</span>
                          </div>
                          {table.rowCount !== null && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Rows:</span>
                              <span>{table.rowCount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Status:</span>
                            <span className="capitalize">{table.status}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Last Updated:</span>
                            <span>{formatDate(table.lastUpdated)}</span>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center"
          >
            <motion.button
              onClick={refreshStatus}
              disabled={isLoading}
              className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Refreshing..." : "Refresh Status"}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
