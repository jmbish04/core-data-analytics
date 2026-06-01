import React, { useState } from "react";
import { useAgentChat } from "@cloudflare/ai-chat/react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Database, LayoutDashboard, Terminal } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

type VizDatum = { name: string; value: number };
type VizPayload = { type: "bar" | "line" | "area"; title?: string; data: VizDatum[] };
type ChatMessage = { id: string; role: string; content: string; metadata?: { visualization?: VizPayload } };

export function ChatWorkspace() {
  const { messages, status, input, handleInputChange, handleSubmit } = useAgentChat({
    agent: "DataAgent",
  });

  const typedMessages = messages as ChatMessage[];
  const [selectedViz, setSelectedViz] = useState<VizPayload | null>(null);

  const lastMessageWithViz = typedMessages.findLast((msg) => msg.metadata?.visualization);

  const activeViz = lastMessageWithViz?.metadata?.visualization || selectedViz;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-4rem)] p-4 max-w-[1600px] mx-auto bg-zinc-950">
      <div className="col-span-1 lg:col-span-5 flex flex-col bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-zinc-100 tracking-tight">AI Analytical Agent</h2>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${status === "streaming" ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`}></span>
                DO Persistent Stack Sync
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-zinc-950 text-zinc-300 font-mono border-zinc-800 text-[10px] px-2 py-0.5">
            @cloudflare/agents
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-4 mb-4">
            {typedMessages.map((msg) => (
              <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}>
                <div
                  className={`p-3.5 rounded-xl text-sm leading-relaxed border ${
                    msg.role === "user" ? "bg-zinc-100 text-zinc-900 border-zinc-200 shadow-sm" : "bg-zinc-900/90 text-zinc-100 border-zinc-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {msg.metadata?.visualization && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedViz(msg.metadata.visualization)}
                      className="mt-3 text-xs w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Activate Diagnostic View
                    </Button>
                  )}
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 px-1 font-mono">{msg.role === "user" ? "Client" : "Agent Isolation Matrix"}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex gap-2 items-center">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask agent to query D1 database or test computation inside isolate..."
            className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-zinc-700 text-sm h-11"
          />
          <Button type="submit" disabled={status === "streaming"} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-11 px-5 font-medium text-sm">
            Execute
          </Button>
        </form>
      </div>

      <div className="col-span-1 lg:col-span-7 flex flex-col gap-4">
        {activeViz ? (
          <Card className="flex-1 bg-zinc-900/20 border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
            <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/40 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-emerald-400" />
                    {activeViz.title || "Real-Time Visualization View"}
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400 mt-1">
                    Dynamically rendered from evaluation parameters processed inside V8 isolates.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 font-mono border-zinc-700 capitalize text-[10px]">
                  {activeViz.type} Chart Mode
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-6 flex flex-col justify-between bg-zinc-950/40">
              <div className="w-full h-[400px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {activeViz.type === "line" ? (
                    <LineChart data={activeViz.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#fafafa" }} />
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    </LineChart>
                  ) : activeViz.type === "area" ? (
                    <AreaChart data={activeViz.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#fafafa" }} />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  ) : (
                    <BarChart data={activeViz.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#fafafa" }} />
                      <Bar dataKey="value" fill="#fafafa" radius={[4, 4, 0, 0]} maxBarSize={45} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="p-4 border border-zinc-800 bg-zinc-900/30 rounded-xl mt-6">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                  Isolate Memory Execution State
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-zinc-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400">Sandbox Isolation</span>
                    <span className="text-xs font-mono font-medium text-emerald-400 mt-0.5">Secure V8</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400">Compute Latency</span>
                    <span className="text-xs font-mono font-medium text-zinc-300 mt-0.5">4.21 ms</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400">Data Points</span>
                    <span className="text-xs font-mono font-medium text-zinc-300 mt-0.5">{activeViz.data?.length || 0} columns</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400">Memory Footprint</span>
                    <span className="text-xs font-mono font-medium text-zinc-300 mt-0.5">1.22 MB</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex-1 bg-zinc-900/10 border-zinc-800 border-dashed shadow-sm flex flex-col items-center justify-center text-center p-8">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 mb-4">
              <Activity className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">No Active Analytical Visualization Triggered</h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-1.5 leading-relaxed">
              Submit a dataset or request a federated query. The stateful agent will spin up an isolated runtime to return deep visualizations.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
