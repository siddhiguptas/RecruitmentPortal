import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MoreVertical, 
  TrendingUp,
  User,
  ExternalLink
} from "lucide-react";
import { Application } from "../types";
import { cn, formatDate } from "../utils";
import { Button } from "./Button";

interface CandidatePipelineProps {
  applications: Application[];
  onStatusChange: (applicationId: string, newStatus: string) => Promise<void>;
  onViewDetails: (application: Application) => void;
}

const STAGES = [
  { id: "applied", label: "Applied", color: "bg-blue-500" },
  { id: "shortlisted", label: "Shortlisted", color: "bg-amber-500" },
  { id: "interviewing", label: "Interview", color: "bg-purple-500" },
  { id: "offered", label: "Offered", color: "bg-emerald-500" },
  { id: "rejected", label: "Rejected", color: "bg-rose-500" },
];

export const CandidatePipeline: React.FC<CandidatePipelineProps> = ({ 
  applications, 
  onStatusChange,
  onViewDetails
}) => {
  const getCandidatesInStage = (stageId: string) => {
    return applications.filter(app => app.status === stageId);
  };

  const getMatchLabel = (score?: number) => {
    if (!score) return { label: "N/A", color: "text-slate-400 bg-slate-50" };
    if (score >= 85) return { label: "Strong Match", color: "text-emerald-700 bg-emerald-50 border-emerald-100" };
    if (score >= 60) return { label: "Moderate Match", color: "text-amber-700 bg-amber-50 border-amber-100" };
    return { label: "Low Match", color: "text-rose-700 bg-rose-50 border-rose-100" };
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px] -mx-4 px-4 md:mx-0 md:px-0">
      {STAGES.map((stage) => (
        <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", stage.color)} />
              <h3 className="font-bold text-slate-900">{stage.label}</h3>
              <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full font-bold">
                {getCandidatesInStage(stage.id).length}
              </span>
            </div>
          </div>

          <div className="flex-1 bg-slate-100/50 rounded-2xl p-3 space-y-3 border border-slate-200/50">
            <AnimatePresence mode="popLayout">
              {getCandidatesInStage(stage.id).map((app) => {
                const student = typeof app.student === 'string' ? null : app.student;
                const match = getMatchLabel(app.matchScore);
                
                return (
                  <motion.div
                    key={app._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => onViewDetails(app)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{student?.name || "Unknown Student"}</p>
                          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                            Applied {formatDate(app.createdAt)}
                          </p>
                        </div>
                      </div>
                      <button className="p-1 text-slate-400 hover:text-slate-600">
                        <MoreVertical size={16} />
                      </button>
                    </div>

                    {app.matchScore !== undefined && (
                      <div className={cn(
                        "flex items-center justify-between px-2 py-1.5 rounded-lg border mb-3",
                        match.color
                      )}>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{match.label}</span>
                        </div>
                        <span className="text-xs font-black">{app.matchScore}%</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                      <select
                        className="flex-1 bg-slate-50 border-none text-[10px] font-bold uppercase tracking-wider text-slate-500 rounded-lg px-2 py-1.5 focus:ring-0 cursor-pointer hover:bg-slate-100 transition-colors"
                        value={app.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onStatusChange(app._id, e.target.value)}
                      >
                        {STAGES.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(app);
                        }}
                      >
                        <ExternalLink size={14} />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {getCandidatesInStage(stage.id).length === 0 && (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-400 font-medium italic">No candidates</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
