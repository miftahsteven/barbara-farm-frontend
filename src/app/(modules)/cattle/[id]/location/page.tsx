'use client';

import React, { use, useState, useEffect, useRef, useCallback } from 'react';
import { useCattleStore } from '@/lib/useCattleStore';
import { apiFetch } from '@/lib/useAuthStore';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Link from 'next/link';
import {
  ChevronLeft, Radio, MapPin, RefreshCw, Navigation, Signal,
  Battery, Thermometer, AlertTriangle, WifiOff, Clock, ZoomIn,
  ZoomOut, Layers, Activity, Pause, Play
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

const FARM_LON = 121.843059;
const FARM_LAT = -8.67932;
const FARM_RADIUS_KM = 2;

function calcDist(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(km: number) { return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`; }

function mockGPS(id: string, t: number) {
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const angle = (seed * 0.07 + t * 0.00018) % (2 * Math.PI);
  const r = 0.0004 + (seed % 7) * 0.00015;
  return {
    lat: FARM_LAT + Math.sin(angle) * r,
    lon: FARM_LON + Math.cos(angle) * r,
    accuracy: 3 + Math.sin(t * 0.001) * 4,
    speed: Math.max(0, 1.2 + Math.sin(t * 0.0008) * 1.8),
    battery: Math.round(82 + Math.sin(t * 0.0005) * 8),
    signal: Math.round(75 + Math.sin(t * 0.0012) * 20),
    temperature: parseFloat((38.4 + Math.sin(t * 0.0009) * 0.5).toFixed(1)),
    timestamp: new Date().toISOString(),
    heading: (seed * 37 + t * 0.1) % 360,
  };
}

interface PageProps { params: Promise<{ id: string }>; }

export default function CattleLocationPage({ params }: PageProps) {
  const { id } = use(params);
  const cattleId = decodeURIComponent(id);
  const { cattle } = useCattleStore();

  const [cattleData, setCattleData] = useState(cattle.find(c => c.id === cattleId) || null);
  const [loading, setLoading] = useState(!cattleData);
  const [mode, setMode] = useState<'live' | 'current'>('live');
  const [gps, setGps] = useState<ReturnType<typeof mockGPS> | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [distance, setDistance] = useState(0);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'street'>('satellite');
  const [trail, setTrail] = useState<[number, number][]>([]);
  const [mapReady, setMapReady] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const cowMarker = useRef<maplibregl.Marker | null>(null);
  const trailAdded = useRef(false);

  // Fetch cattle if not in store
  useEffect(() => {
    if (cattleData) return;
    apiFetch(`/cattle/${encodeURIComponent(cattleId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setCattleData(d); })
      .finally(() => setLoading(false));
  }, [cattleId]);

  // Init map with exact ResizeObserver pattern from dashboard
  useEffect(() => {
    const container = mapContainer.current;
    if (!container || map.current) return;

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
            
            // Farm marker
            const farmEl = document.createElement('div');
            farmEl.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;"><div style="background:#006B3F;color:white;padding:5px 14px;border-radius:14px;border:2px solid white;font-weight:800;font-size:13px;box-shadow:0 6px 20px rgba(0,107,63,0.5);white-space:nowrap;">🏠 Barbara Farm</div><div style="width:12px;height:12px;background:#006B3F;border:2px solid white;border-radius:50%;margin-top:3px;"></div></div>`;
            new maplibregl.Marker({ element: farmEl, anchor: 'bottom' }).setLngLat([FARM_LON, FARM_LAT]).addTo(map.current!);

            // Trail source
            map.current.addSource('trail', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
            map.current.addLayer({ id: 'trail-line', type: 'line', source: 'trail', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#4ade80', 'line-width': 3, 'line-opacity': 0.8, 'line-dasharray': [2, 1.5] } });
            trailAdded.current = true;
            setMapReady(true);
          });

          resizeObserver.disconnect();
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      map.current?.remove();
      map.current = null;
      trailAdded.current = false;
      cowMarker.current = null;
    };
  }, [cattleId]);

  const fetchGPS = useCallback(() => {
    if (!cattleId) return;
    setFetching(true);
    setTimeout(() => {
      const data = mockGPS(cattleId, Date.now());
      setGps(data);
      setLastUpdate(new Date());
      setFetching(false);
      const dist = calcDist(FARM_LAT, FARM_LON, data.lat, data.lon);
      setDistance(dist);
      if (mode === 'live') {
        setTrail(prev => {
          const next = [...prev, [data.lon, data.lat] as [number, number]];
          return next.slice(-60);
        });
      }
    }, 500);
  }, [cattleId, mode]);

  // Update map marker & trail
  useEffect(() => {
    if (!gps || !map.current || !mapReady) return;
    const { lat, lon } = gps;

    if (!cowMarker.current) {
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
          <div style="background:rgba(15,31,22,0.9);backdrop-filter:blur(8px);color:#4ade80;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:800;border:1px solid rgba(74,222,128,0.3);margin-bottom:4px;white-space:nowrap;">${cattleId}</div>
          <div class="cow-pulse" style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#16a34a,#15803d);border:3px solid white;box-shadow:0 4px 20px rgba(22,163,74,0.6);display:flex;align-items:center;justify-content:center;font-size:24px;position:relative;">🐄</div>
        </div>`;
      cowMarker.current = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([lon, lat]).addTo(map.current!);
    } else {
      cowMarker.current.setLngLat([lon, lat]);
    }

    if (trailAdded.current && trail.length > 1) {
      const src = map.current.getSource('trail') as maplibregl.GeoJSONSource;
      src?.setData({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: trail }, properties: {} }] });
    }

    if (mode === 'live' && autoRefresh) {
      map.current.easeTo({ center: [lon, lat], duration: 1500 });
    }
  }, [gps, mapReady, trail, mode, autoRefresh, cattleId]);

  // Initial fetch
  useEffect(() => { fetchGPS(); }, [fetchGPS]);

  // Auto-refresh countdown
  useEffect(() => {
    if (mode !== 'live' || !autoRefresh) return;
    const t = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { fetchGPS(); return 5; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [mode, autoRefresh, fetchGPS]);

  if (loading) return (
    <div className="min-h-screen bg-[#0f1f16] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-[#4ade80]" />
    </div>
  );

  const lostSignal = gps ? (gps.signal < 25 || distance > FARM_RADIUS_KM) : false;
  const signalColor = lostSignal ? '#ef4444' : gps && gps.signal > 60 ? '#4ade80' : '#fbbf24';
  const battColor = gps && gps.battery < 20 ? '#ef4444' : gps && gps.battery < 50 ? '#fbbf24' : '#4ade80';

  return (
    <div className="min-h-screen bg-[#0a1510] flex flex-col">
      {/* Header */}
      <header className="bg-[#0f1f16] border-b border-[#1e3a28] px-4 md:px-8 py-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link href={`/cattle/${encodeURIComponent(cattleId)}`}
            className="flex items-center gap-2 text-[#6b9e7e] hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-semibold text-sm hidden sm:block">Kembali ke Profil</span>
          </Link>
          <div className="w-px h-6 bg-[#1e3a28]" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#006B3F]/20 border border-[#006B3F]/30 flex items-center justify-center text-lg">🐄</div>
            <div>
              <h1 className="text-white font-black">{cattleId}</h1>
              <p className="text-[#4a7a5e] text-xs">{cattleData?.name || ''} • Pelacak GPS</p>
            </div>
          </div>
          {mode === 'live' && autoRefresh && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-red-400 text-xs font-bold">LIVE</span>
            </div>
          )}
        </div>

        {/* Mode Switch */}
        <div className="flex bg-[#1a2f22] rounded-xl p-1 border border-[#1e3a28] gap-1">
          <button
            onClick={() => { setMode('live'); setAutoRefresh(true); setCountdown(5); setTrail([]); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'live' ? 'bg-red-500 text-white shadow' : 'text-[#6b9e7e] hover:text-white'}`}
          >
            <Radio className="w-3.5 h-3.5" /> Live
          </button>
          <button
            onClick={() => { setMode('current'); setAutoRefresh(false); setTrail([]); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'current' ? 'bg-[#006B3F] text-white shadow' : 'text-[#6b9e7e] hover:text-white'}`}
          >
            <MapPin className="w-3.5 h-3.5" /> Posisi Sekarang
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Map */}
        <div className="flex-1 relative" style={{ minHeight: '550px', background: '#0a1510' }}>
          <div ref={mapContainer} className="absolute inset-0" />

          {/* Map Controls */}
          <div className="absolute right-3 top-3 flex flex-col gap-2 z-10">
            <button onClick={() => map.current?.zoomIn()} className="w-9 h-9 bg-[#0f1f16]/90 backdrop-blur border border-[#1e3a28] rounded-xl flex items-center justify-center text-white hover:bg-[#1a2f22] transition-all">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={() => map.current?.zoomOut()} className="w-9 h-9 bg-[#0f1f16]/90 backdrop-blur border border-[#1e3a28] rounded-xl flex items-center justify-center text-white hover:bg-[#1a2f22] transition-all">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={() => gps && map.current?.flyTo({ center: [gps.lon, gps.lat], zoom: 17, pitch: 45 })}
              className="w-9 h-9 bg-[#006B3F]/80 backdrop-blur border border-[#006B3F]/50 rounded-xl flex items-center justify-center text-white hover:bg-[#006B3F] transition-all" title="Ke posisi sapi">
              <Navigation className="w-4 h-4" />
            </button>
            <button onClick={() => map.current?.flyTo({ center: [FARM_LON, FARM_LAT], zoom: 15 })}
              className="w-9 h-9 bg-[#0f1f16]/90 backdrop-blur border border-[#1e3a28] rounded-xl flex items-center justify-center text-white hover:bg-[#1a2f22] transition-all" title="Ke Farm">
              <Layers className="w-4 h-4" />
            </button>
          </div>

          {/* Loading overlay */}
          {fetching && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-2 bg-[#0f1f16]/90 backdrop-blur border border-[#1e3a28] rounded-xl">
              <Loader2 className="w-3.5 h-3.5 text-[#4ade80] animate-spin" />
              <span className="text-[#4ade80] text-xs font-bold">Memuat GPS...</span>
            </div>
          )}

          {/* Countdown badge (live mode) */}
          {mode === 'live' && autoRefresh && !fetching && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-2 bg-[#0f1f16]/90 backdrop-blur border border-red-500/30 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-red-400 text-xs font-bold">Refresh dalam {countdown}s</span>
            </div>
          )}

          {/* Lost signal overlay */}
          {lostSignal && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a1510]/75 backdrop-blur-sm z-10">
              <div className="text-center p-8 max-w-sm">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-500/30">
                  <WifiOff className="w-10 h-10 text-red-400" />
                </div>
                <h3 className="text-white font-black text-xl mb-3">⚠️ Sinyal Lemah / Terputus</h3>
                <p className="text-[#6b9e7e] text-sm mb-2">Sapi terdeteksi menjauh dari area farm.</p>
                <p className="text-sm mb-6">Jarak: <span className="text-red-400 font-black text-base">{fmtDist(distance)}</span> <span className="text-[#6b9e7e]">dari Barbara Farm</span></p>
                <button onClick={fetchGPS}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500/20 border border-red-500/40 text-red-400 rounded-xl font-bold mx-auto hover:bg-red-500/30 transition-all">
                  <RefreshCw className="w-4 h-4" /> Coba Refresh
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-[320px] bg-[#0f1f16] border-t lg:border-t-0 lg:border-l border-[#1e3a28] flex flex-col overflow-y-auto">
          
          {/* Status cards */}
          <div className="p-5 space-y-3">
            <p className="text-[#4a7a5e] text-[10px] font-bold uppercase tracking-widest">Status Perangkat</p>

            <div className="grid grid-cols-3 gap-2">
              {/* Signal */}
              <div className="p-3 bg-[#1a2f22] rounded-xl border border-[#1e3a28] text-center">
                <Signal className="w-5 h-5 mx-auto mb-1" style={{ color: signalColor }} />
                <p className="text-[10px] text-[#4a7a5e]">Sinyal</p>
                <p className="font-black text-sm" style={{ color: signalColor }}>{gps?.signal ?? '--'}%</p>
              </div>
              {/* Battery */}
              <div className="p-3 bg-[#1a2f22] rounded-xl border border-[#1e3a28] text-center">
                <Battery className="w-5 h-5 mx-auto mb-1" style={{ color: battColor }} />
                <p className="text-[10px] text-[#4a7a5e]">Baterai</p>
                <p className="font-black text-sm" style={{ color: battColor }}>{gps?.battery ?? '--'}%</p>
              </div>
              {/* Temp */}
              <div className="p-3 bg-[#1a2f22] rounded-xl border border-[#1e3a28] text-center">
                <Thermometer className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                <p className="text-[10px] text-[#4a7a5e]">Suhu</p>
                <p className="font-black text-sm text-orange-400">{gps?.temperature ?? '--'}°</p>
              </div>
            </div>

            {/* Distance alert */}
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${distance > FARM_RADIUS_KM ? 'bg-red-500/10 border-red-500/30' : 'bg-[#006B3F]/10 border-[#006B3F]/30'}`}>
              {distance > FARM_RADIUS_KM
                ? <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                : <MapPin className="w-5 h-5 text-[#4ade80] shrink-0" />}
              <div>
                <p className={`text-sm font-bold ${distance > FARM_RADIUS_KM ? 'text-red-400' : 'text-[#4ade80]'}`}>
                  {distance > FARM_RADIUS_KM ? 'Jauh dari Area Farm!' : 'Dalam Area Farm'}
                </p>
                <p className="text-xs text-[#4a7a5e]">Jarak: {fmtDist(distance)} dari HQ</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#1e3a28] p-5 space-y-3">
            <p className="text-[#4a7a5e] text-[10px] font-bold uppercase tracking-widest">Koordinat GPS</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Latitude', value: gps?.lat.toFixed(6) },
                { label: 'Longitude', value: gps?.lon.toFixed(6) },
                { label: 'Akurasi', value: gps ? `±${gps.accuracy.toFixed(1)} m` : '--' },
                { label: 'Kecepatan', value: gps ? `${gps.speed.toFixed(1)} km/h` : '--' },
              ].map(item => (
                <div key={item.label} className="p-3 bg-[#1a2f22] rounded-xl border border-[#1e3a28]">
                  <p className="text-[10px] text-[#4a7a5e] mb-0.5">{item.label}</p>
                  <p className="text-white font-mono text-xs font-bold truncate">{item.value ?? '--'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Movement info (live mode) */}
          {mode === 'live' && trail.length > 0 && (
            <div className="border-t border-[#1e3a28] p-5 space-y-2">
              <p className="text-[#4a7a5e] text-[10px] font-bold uppercase tracking-widest">Jejak Pergerakan</p>
              <div className="flex items-center gap-2 p-3 bg-[#1a2f22] rounded-xl border border-[#1e3a28]">
                <Activity className="w-4 h-4 text-[#4ade80]" />
                <div>
                  <p className="text-white text-sm font-bold">{trail.length} titik tercatat</p>
                  <p className="text-[10px] text-[#4a7a5e]">Jalur sesi ini</p>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="border-t border-[#1e3a28] p-5 mt-auto space-y-3">
            {mode === 'live' ? (
              <button
                onClick={() => setAutoRefresh(p => !p)}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm border transition-all ${
                  autoRefresh
                    ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                    : 'bg-[#006B3F]/20 border-[#006B3F]/40 text-[#4ade80] hover:bg-[#006B3F]/30'
                }`}
              >
                {autoRefresh ? <><Pause className="w-4 h-4" /> Auto Refresh ({countdown}s)</> : <><Play className="w-4 h-4" /> Mulai Auto Refresh</>}
              </button>
            ) : (
              <button
                onClick={fetchGPS}
                disabled={fetching}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#006B3F]/20 border border-[#006B3F]/40 text-[#4ade80] rounded-xl font-bold text-sm hover:bg-[#006B3F]/30 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
                {fetching ? 'Memuat Posisi...' : 'Refresh Posisi Manual'}
              </button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#4a7a5e]">
              <Clock className="w-3 h-3" />
              {lastUpdate ? `Terakhir: ${lastUpdate.toLocaleTimeString('id-ID')}` : 'Belum ada data'}
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .cow-pulse::after {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 2.5px solid rgba(74,222,128,0.5);
          animation: cowPulse 2s ease-out infinite;
        }
        @keyframes cowPulse {
          0% { transform: scale(1); opacity: 0.9; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
