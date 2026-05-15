"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Filter, Plus, Minus, Layers, RefreshCw, MapPin } from "lucide-react";
import { useCattleStore } from '@/lib/useCattleStore';

interface FarmMapProps {
  className?: string;
}

const FARM_LON = 121.843059;
const FARM_LAT = -8.67932;

// Simulate GPS position for a cattle ID (random walk around farm)
function getSimulatedPosition(cattleId: string, index: number, t: number) {
  // Use a consistent seed per cattle so each has a unique orbit/radius
  const seed = cattleId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const speed = 0.00008 + (seed % 11) * 0.000015;
  const radius = 0.0003 + (index % 5) * 0.00014 + (seed % 7) * 0.00008;
  const phaseOffset = (seed * 0.43) % (2 * Math.PI);
  const angle = phaseOffset + t * speed;

  return {
    lat: FARM_LAT + Math.sin(angle) * radius,
    lon: FARM_LON + Math.cos(angle) * radius * 1.1,
  };
}

// Assign a color per cattle based on index
const MARKER_COLORS = [
  '#16a34a', '#2563eb', '#9333ea', '#dc2626',
  '#ea580c', '#0891b2', '#65a30d', '#d97706',
  '#be185d', '#7c3aed',
];

const FarmMap: React.FC<FarmMapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const cowMarkersRef = useRef<Record<string, maplibregl.Marker>>({});
  const animFrameRef = useRef<number | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [mapReady, setMapReady] = useState(false);

  // Pull AKTIF cattle from the store (real data)
  const { cattle, fetchCattle } = useCattleStore();
  const activeCattle = cattle.filter(c => c.status === 'AKTIF' || c.status === 'PEMANTAUAN' || c.status === 'SIAP_JUAL');

  // Fetch cattle on mount if not already loaded
  useEffect(() => {
    if (cattle.length === 0) fetchCattle();
  }, [cattle.length, fetchCattle]);

  // Animate cattle markers
  const animateMarkers = useCallback(() => {
    if (!map.current || !mapReady || activeCattle.length === 0) return;
    const t = Date.now() * 0.001; // seconds

    activeCattle.forEach((cow, index) => {
      const pos = getSimulatedPosition(cow.id, index, t);
      const color = MARKER_COLORS[index % MARKER_COLORS.length];

      if (cowMarkersRef.current[cow.id]) {
        // Just update position smoothly
        cowMarkersRef.current[cow.id].setLngLat([pos.lon, pos.lat]);
      } else {
        // Create marker
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;" title="${cow.id}${cow.name ? ' - ' + cow.name : ''}">
            <div style="background:rgba(15,31,22,0.88);color:white;padding:2px 8px;border-radius:8px;font-size:9px;font-weight:800;white-space:nowrap;border:1px solid ${color}66;margin-bottom:3px;letter-spacing:0.5px;">${cow.id}</div>
            <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,${color},${color}aa);border:2.5px solid white;box-shadow:0 3px 14px ${color}55;display:flex;align-items:center;justify-content:center;font-size:16px;">🐄</div>
          </div>`;

        const popup = new maplibregl.Popup({ offset: 28, closeButton: false, maxWidth: '200px' })
          .setHTML(`
            <div style="font-family:sans-serif;padding:4px 2px;">
              <strong style="color:#006B3F;font-size:13px;">${cow.id}</strong>
              ${cow.name ? `<br/><span style="font-size:11px;color:#444;">${cow.name}</span>` : ''}
              <br/><span style="font-size:10px;color:#888;">📍 GPS Aktif · Kandang ${cow.pen || '-'}</span>
            </div>`);

        cowMarkersRef.current[cow.id] = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([pos.lon, pos.lat])
          .setPopup(popup)
          .addTo(map.current!);
      }
    });

    // Remove markers for cattle that are no longer active
    Object.keys(cowMarkersRef.current).forEach(id => {
      if (!activeCattle.find(c => c.id === id)) {
        cowMarkersRef.current[id].remove();
        delete cowMarkersRef.current[id];
      }
    });

    animFrameRef.current = requestAnimationFrame(animateMarkers);
  }, [mapReady, activeCattle]);

  // Start animation loop once map and cattle are ready
  useEffect(() => {
    if (!mapReady || activeCattle.length === 0) return;
    animFrameRef.current = requestAnimationFrame(animateMarkers);
    setLastUpdate(new Date().toLocaleTimeString('id-ID'));
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [mapReady, animateMarkers, activeCattle.length]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCattle().finally(() => {
      setLastUpdate(new Date().toLocaleTimeString('id-ID'));
      setIsRefreshing(false);
    });
  };

  // Map init
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    const container = mapContainer.current;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && !map.current) {
          map.current = new maplibregl.Map({
            container,
            style: {
              version: 8,
              sources: {
                'raster-tiles': {
                  type: 'raster',
                  tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                  tileSize: 256,
                  attribution: 'Tiles &copy; Esri',
                },
              },
              layers: [{ id: 'simple-tiles', type: 'raster', source: 'raster-tiles', minzoom: 0, maxzoom: 22 }],
            },
            center: [FARM_LON, FARM_LAT],
            zoom: 15,
            pitch: 30,
            attributionControl: false,
          });

          map.current.on('load', () => {
            if (!map.current) return;
            map.current.setCenter([FARM_LON, FARM_LAT]);
            map.current.resize();

            // Farm HQ marker
            const farmEl = document.createElement('div');
            farmEl.innerHTML = `
              <div style="display:flex;flex-direction:column;align-items:center;">
                <div style="background:#006B3F;padding:4px 12px;border-radius:12px;border:2px solid white;color:white;font-weight:bold;font-size:13px;box-shadow:0 4px 12px rgba(0,107,63,0.4);white-space:nowrap;margin-bottom:4px;">🏠 Barbara Farm</div>
                <div style="width:12px;height:12px;background:#006B3F;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>
              </div>`;
            new maplibregl.Marker({ element: farmEl, anchor: 'bottom' })
              .setLngLat([FARM_LON, FARM_LAT])
              .addTo(map.current!);

            setMapReady(true);
          });

          resizeObserver.disconnect();
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      Object.values(cowMarkersRef.current).forEach(m => m.remove());
      cowMarkersRef.current = {};
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const handleResize = () => { if (map.current) map.current.resize(); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-xl font-bold">Peta Sebaran Sapi</CardTitle>
          {lastUpdate && (
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-green-500" />
              {activeCattle.length} sapi terdeteksi · Update: {lastUpdate}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 border border-border-neutral rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-green-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-border-neutral rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative group">
          <div
            ref={mapContainer}
            className="w-full h-[420px] rounded-xl overflow-hidden border border-border-neutral"
          />

          {/* Legend */}
          <div className="absolute left-4 bottom-4 bg-white/90 backdrop-blur rounded-xl p-3 shadow-lg border border-gray-100 text-xs space-y-1.5">
            <p className="font-bold text-gray-700 mb-1">Legenda</p>
            <div className="flex items-center gap-2"><span>🏠</span><span className="text-gray-600">Barbara Farm HQ</span></div>
            <div className="flex items-center gap-2"><span>🐄</span><span className="text-gray-600">Sapi (GPS Simulasi)</span></div>
          </div>

          {/* Custom Map Controls */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <div className="flex flex-col bg-white rounded-lg shadow-lg border border-border-neutral overflow-hidden">
              <button onClick={() => map.current?.zoomIn()} className="p-2 hover:bg-gray-100 border-b border-border-neutral">
                <Plus className="h-5 w-5 text-text-primary" />
              </button>
              <button onClick={() => map.current?.zoomOut()} className="p-2 hover:bg-gray-100">
                <Minus className="h-5 w-5 text-text-primary" />
              </button>
            </div>
            <button className="p-2 bg-white rounded-lg shadow-lg border border-border-neutral hover:bg-gray-100">
              <Layers className="h-5 w-5 text-text-primary" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmMap;
