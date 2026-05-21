import React from "react";
import { CampusBuilding } from "../types";
import { CAMPUS_BUILDINGS } from "../data";
import { MapPin, Info } from "lucide-react";

interface CampusMapProps {
  highlightedBuildingId?: string;
  selectedBuildingId?: string;
  onSelectBuilding?: (building: CampusBuilding) => void;
  className?: string;
}

export default function CampusMap({
  highlightedBuildingId,
  selectedBuildingId,
  onSelectBuilding,
  className = "",
}: CampusMapProps) {
  return (
    <div className={`relative bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-inner ${className}`}>
      {/* Campus Map Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* Elegant Map Grid Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Draw subtle grid lines mimicking campus walkways */}
        <div className="absolute top-[35%] left-0 w-full h-[2px] bg-slate-700/50" />
        <div className="absolute top-[48%] left-0 w-full h-[2px] bg-slate-700/50 rotate-6" />
        <div className="absolute top-[52%] left-0 w-full h-[2px] bg-slate-700/50 -rotate-3" />
        <div className="absolute left-[45%] top-0 h-full w-[2px] bg-slate-700/50" />
        <div className="absolute left-[62%] top-0 h-full w-[2px] bg-slate-700/50" />
        
        {/* Memorial Way path */}
        <div className="absolute left-[35%] top-0 h-full w-[30px] bg-slate-800/20 border-l border-r border-slate-700/20 rotate-12" />
        {/* Rainier Vista path */}
        <div className="absolute left-[38%] top-[50%] h-[300px] w-[50px] bg-slate-800/30 border-l border-r border-slate-700/20 rotate-[35deg]" />
        
        {/* Red Square representation! */}
        <div className="absolute top-[32%] left-[38%] w-[120px] h-[100px] bg-slate-800/30 border border-slate-700/40 rounded-lg flex items-center justify-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Red Square</span>
        </div>
        
        {/* Drumheller fountain representation! */}
        <div className="absolute bottom-[20%] left-[58%] w-[50px] h-[50px] rounded-full bg-sky-950/40 border border-sky-800/40 flex items-center justify-center animate-pulse">
          <div className="w-2 h-2 rounded-full bg-sky-400" />
        </div>
        <span className="absolute bottom-[27%] left-[64%] text-[9px] uppercase tracking-wider text-slate-500 font-mono">Rainier Vista</span>
      </div>

      {/* Buildings list rendered as interactive circles */}
      <div className="absolute inset-0">
        {CAMPUS_BUILDINGS.map((building) => {
          const isHighlighted = highlightedBuildingId === building.id;
          const isSelected = selectedBuildingId === building.id;
          
          return (
            <button
              key={building.id}
              onClick={() => onSelectBuilding?.(building)}
              style={{ left: `${building.x}%`, top: `${building.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group z-10 p-2 flex flex-col items-center transition-transform hover:scale-110 active:scale-95`}
              title={building.name}
            >
              {/* Highlight beacon pulse */}
              {isHighlighted && (
                <span className="absolute inline-flex h-8 w-8 rounded-full bg-amber-400 opacity-75 animate-ping" />
              )}
              {isSelected && (
                <span className="absolute inline-flex h-8 w-8 rounded-full bg-brand-gold opacity-75 animate-pulse" />
              )}
              
              {/* Building Node Circle */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-lg transition-all ${
                  isHighlighted
                    ? "bg-amber-400 border-white text-slate-900"
                    : isSelected
                    ? "bg-brand-gold border-white text-slate-900"
                    : "bg-brand-purple border-brand-gold-light text-brand-gold-light group-hover:bg-brand-purple-light"
                }`}
              >
                <span className="text-[9px] font-bold font-mono">{building.shortName.substring(0, 3).toUpperCase()}</span>
              </div>
              
              {/* Popup tooltip text */}
              <div className="absolute bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-700 text-white rounded px-2 py-1 text-[10px] pointer-events-none whitespace-nowrap shadow-xl flex items-center gap-1 z-20">
                <span className="font-semibold text-brand-gold">{building.shortName}</span>
                {isHighlighted && <span className="text-amber-300 font-bold">(Event Here!)</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 bg-slate-950/95 border border-slate-800 rounded-lg p-2 max-w-[200px] shadow-lg pointer-events-none text-[9px] text-slate-400 font-mono space-y-1.5 z-10">
        <div className="text-slate-200 font-semibold mb-1 uppercase tracking-wider text-[10px] border-b border-slate-800 pb-0.5">UW Core Campus</div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-purple border border-brand-gold-light" />
          <span>Building / Kiosk Zone</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative w-2.5 h-2.5">
            <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-amber-400 border border-white" />
          </div>
          <span className="text-amber-300 font-bold">Active Event location</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-gold border border-white" />
          <span>Selected Building</span>
        </div>
      </div>
    </div>
  );
}
