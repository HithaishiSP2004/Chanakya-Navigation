'use client';

import React, { useState } from 'react';
import { Layers, Check, X, Shield, Leaf, Activity, Download } from 'lucide-react';
import { GISLayerType } from '@/types/spatial';
import { GISRepository } from '@/repositories/gisRepository';
import { GISValidationTool } from '@/utils/gisValidation';
import { GeoJSONPipeline } from '@/utils/geoJsonPipeline';
import { mockVenues } from '@/repositories/venueRepository';

interface GISLayerControlsProps {
  activeLayers: Record<GISLayerType, boolean>;
  onToggleLayer: (layer: GISLayerType) => void;
}

export const GISLayerControls: React.FC<GISLayerControlsProps> = ({
  activeLayers,
  onToggleLayer,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reportText, setReportText] = useState<string | null>(null);

  const layerItems: { id: GISLayerType; label: string; iconName: string }[] = [
    { id: 'BUILDINGS', label: 'Building Footprints', iconName: 'Building' },
    { id: 'WALKWAYS', label: 'Pedestrian Walkways', iconName: 'Route' },
    { id: 'ENTRANCES', label: 'Building Entrances', iconName: 'Door' },
    { id: 'POIS', label: 'Campus POI Markers', iconName: 'MapPin' },
    { id: 'NAVIGATION_GRAPH', label: 'Routing Graph Mesh', iconName: 'GitBranch' },
    { id: 'EMERGENCY', label: 'Emergency Assembly Points', iconName: 'Shield' },
    { id: 'SUSTAINABILITY', label: 'Net-Zero Solar Infrastructure', iconName: 'Leaf' },
  ];

  const handleRunHealthCheck = () => {
    const report = GISValidationTool.runHealthCheck(GISRepository.getBuildings(), mockVenues);
    setReportText(`GIS Health Score: ${report.gisIntegrityScore}% (${report.status}) - ${report.totalBuildings} Buildings, ${report.totalEntrances} Entrances, ${report.totalGraphNodes} Graph Nodes.`);
  };

  const handleExportGeoJSON = () => {
    const geoJson = GeoJSONPipeline.exportCampusToGeoJSON(GISRepository.getBuildings());
    const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chanakya-campus-gis-${geoJson.metadata?.version || 'v1'}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle GIS Layers Panel"
        className={`p-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl text-slate-200 hover:text-emerald-400 active:scale-95 transition-all ${
          isOpen ? 'ring-2 ring-emerald-500/60 text-emerald-400' : ''
        }`}
      >
        <Layers className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-72 p-3 rounded-2xl bg-slate-950/98 backdrop-blur-2xl border border-slate-800 shadow-2xl flex flex-col gap-2.5 text-xs animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-slate-100">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>GIS Layer Controls</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-1 max-h-60 overflow-y-auto no-scrollbar">
            {layerItems.map((item) => {
              const isActive = activeLayers[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => onToggleLayer(item.id)}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-semibold'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                      isActive
                        ? 'bg-emerald-500 border-emerald-400 text-white'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunHealthCheck}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-semibold hover:bg-slate-800 active:scale-95 transition-all"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>GIS Audit</span>
              </button>

              <button
                onClick={handleExportGeoJSON}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-900 border border-slate-700 text-blue-400 font-semibold hover:bg-slate-800 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>GeoJSON</span>
              </button>
            </div>

            {reportText && (
              <p className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-[10px] text-emerald-300 leading-tight">
                {reportText}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
