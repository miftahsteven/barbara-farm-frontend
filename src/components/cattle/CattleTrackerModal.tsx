'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Cattle } from '@/lib/useCattleStore';
import { apiFetch } from '@/lib/useAuthStore';
import {
  X, MapPin, Wifi, WifiOff, RefreshCw, Radio, ZoomIn, ZoomOut,
  Navigation, Clock, AlertTriangle, Signal, Battery, Thermometer
} from 'lucide-react';

interface CattleTrackerModalProps {
  cattle: Cattle | null;
  onClose: () => void;
}

// Farm HQ location
const FARM_LON = 121.843059;
const FARM_LAT = -8.67932;
const DEPOK_LON = 106.83416;
const DEPOK_LAT = -6.36672;
const FARM_RADIUS_KM = 2; // alert if > 2km from farm

// Simulated GPS data for demo
function generateMockGPS(baseId: string, time: number) {
  const seed = baseId.charCodeAt(0) + baseId.charCodeAt(baseId.length - 1);
  const angle = (seed * 0.1 + time * 0.0002) % (2 * Math.PI);
  const radius = 0.0005 + (seed % 5) * 0.0002;
  return {
    lat: FARM_LAT + Math.sin(angle) * radius,
    lon: FARM_LON + Math.cos(angle) * radius,
    accuracy: 3 + Math.random() * 5,
    speed: 0.5 + Math.random() * 2.5,
    battery: 78 + Math.floor(Math.sin(time * 0.001) * 10),
    signal: Math.floor(70 + Math.sin(time * 0.0015) * 25),
    temperature: 38.2 + Math.random() * 0.6,
    timestamp: new Date().toISOString(),
  };
}

function calcDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistanceText(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(2)} km`;
}

export const CattleTrackerModal: React.FC<CattleTrackerModalProps> = ({ cattle, onClose }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const farmMarkerRef = useRef<maplibregl.Marker | null>(null);
  const trailSourceAdded = useRef(false);
  const trailCoords = useRef<[number, number][]>([]);

  const [mode, setMode] = useState<'live' | 'current'>('live');
  const [gpsData, setGpsData] = useState<{
    lat: number;
    lon: number;
    accuracy: number;
    speed: number;
    battery: number;
    signal: number;
    temperature: number;
    timestamp: string;
  } | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLostSignal, setIsLostSignal] = useState(false);
  const [distanceFromFarm, setDistanceFromFarm] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [hasGpsTracker, setHasGpsTracker] = useState(false);

  const fetchGPS = useCallback(async () => {
    if (!cattle) return;
    
    const imei = cattle.eartagNo;
    const isRealIMEI = imei && /^\d{15}$/.test(imei);

    if (!isRealIMEI) {
      // No real IMEI -> Show default Flores Farm NTT HQ empty map view
      setHasGpsTracker(false);
      setGpsData({
        lat: FARM_LAT,
        lon: FARM_LON,
        accuracy: 0,
        speed: 0,
        battery: 0,
        signal: 0,
        temperature: 38.2, // normal body temp fallback
        timestamp: new Date().toISOString(),
      });
      setLastUpdated(new Date());
      setDistanceFromFarm(0);
      setIsLostSignal(false);
      return;
    }

    setHasGpsTracker(true);
    setIsLoading(true);
    try {
      const res = await apiFetch(`/gps/gpsid/devices/${imei}`);
      const result = await res.json().catch(() => ({}));
      
      if (res.ok && result.status && result.message?.data) {
        const dev = result.message.data;
        const lat = parseFloat(dev.latitude);
        const lon = parseFloat(dev.longitude);
        
        // Parse battery percentage safely
        const batteryPct = typeof dev.battery === 'string' ? parseInt(dev.battery) : (dev.battery || 80);
        
        // Map GPS signal from the 1-4 or percentage value
        const signalPct = dev.gsm_signal ? (parseInt(dev.gsm_signal) * 25) : 100;

        const data = {
          lat: isNaN(lat) ? FARM_LAT : lat,
          lon: isNaN(lon) ? FARM_LON : lon,
          accuracy: dev.accuracy ? parseFloat(dev.accuracy) : 5.0,
          speed: dev.speed ? parseFloat(dev.speed) : 0,
          battery: batteryPct,
          signal: signalPct,
          temperature: dev.temperature ? parseFloat(dev.temperature) : 38.2, // normal body temp fallback
          timestamp: dev.last_update || new Date().toISOString(),
        };

        setGpsData(data);
        setLastUpdated(new Date());
        
        const isNearDepok = data.lon < 110;
        const hqLon = isNearDepok ? DEPOK_LON : FARM_LON;
        const hqLat = isNearDepok ? DEPOK_LAT : FARM_LAT;
        
        const dist = calcDistanceKm(hqLat, hqLon, data.lat, data.lon);
        setDistanceFromFarm(dist);
        setIsLostSignal(signalPct < 20);
      } else {
        console.error("Failed to load device details from GPS.id API:", result);
      }
    } catch (error) {
      console.error("Error fetching live GPS data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [cattle]);

  // Init map with exact ResizeObserver pattern from dashboard
  useEffect(() => {
    const container = mapContainer.current;
    if (!container || map.current) return;
    if (!gpsData) return; // Wait until initial GPS coordinates are loaded!

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && !map.current) {
          const initLon = gpsData.lon;
          const initLat = gpsData.lat;

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
            center: [initLon, initLat],
            zoom: 15,
            pitch: 30,
            attributionControl: false,
          });

          map.current.on('load', () => {
            if (!map.current) return;
            map.current.setCenter([initLon, initLat]);
            map.current.resize();
            
            // Farm marker
            const isNearDepok = initLon < 110;
            const hqLon = isNearDepok ? DEPOK_LON : FARM_LON;
            const hqLat = isNearDepok ? DEPOK_LAT : FARM_LAT;
            const hqName = isNearDepok ? "🏠 Barbara Farm Office" : "🏠 Barbara Farm";

            const farmEl = document.createElement('div');
            farmEl.innerHTML = `
              <div style="display:flex;flex-direction:column;align-items:center;">
                <div style="background:#006B3F;padding:4px 12px;border-radius:12px;border:2px solid white;color:white;font-weight:bold;font-size:12px;box-shadow:0 4px 12px rgba(0,107,63,0.4);white-space:nowrap;margin-bottom:4px;">${hqName}</div>
                <div style="width:12px;height:12px;background:#006B3F;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>
              </div>`;
            farmMarkerRef.current = new maplibregl.Marker({ element: farmEl, anchor: 'bottom' })
              .setLngLat([hqLon, hqLat])
              .addTo(map.current!);

            // Trail source
            map.current.addSource('trail', {
              type: 'geojson',
              data: { type: 'FeatureCollection', features: [] },
            });
            map.current.addLayer({
              id: 'trail-line',
              type: 'line',
              source: 'trail',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#22c55e', 'line-width': 3, 'line-opacity': 0.7, 'line-dasharray': [2, 1] },
            });
            trailSourceAdded.current = true;
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
      trailSourceAdded.current = false;
      markerRef.current = null;
      farmMarkerRef.current = null;
    };
  }, [gpsData]);

  // Update marker when gpsData changes
  useEffect(() => {
    if (!gpsData || !map.current || !mapReady) return;
    const { lat, lon } = gpsData;

    if (!hasGpsTracker) {
      // If no GPS tracker, remove cow marker if exists
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      // Set trail to empty
      if (trailSourceAdded.current && map.current) {
        const src = map.current.getSource('trail') as maplibregl.GeoJSONSource;
        src?.setData({ type: 'FeatureCollection', features: [] });
      }
      // Ease map to NTT Farm HQ
      map.current.easeTo({ center: [FARM_LON, FARM_LAT], zoom: 14, duration: 1200 });
      return;
    }

    if (!markerRef.current) {
      const el = document.createElement('div');
      el.style.cssText = 'cursor:pointer;';
      el.innerHTML = `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
          <div style="position:absolute;top:-30px;left:50%;transform:translateX(-50%);background:rgba(17,33,27,0.85);backdrop-filter:blur(8px);color:white;padding:3px 8px;border-radius:8px;font-size:10px;font-weight:bold;white-space:nowrap;border:1px solid rgba(255,255,255,0.15);">${cattle?.id}</div>
          <div class="cattle-pulse" style="position:relative;width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#16a34a,#15803d);border:3px solid white;box-shadow:0 4px 16px rgba(22,163,74,0.5);display:flex;align-items:center;justify-content:center;font-size:22px;">🐄</div>
        </div>
      `;
      markerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lon, lat])
        .addTo(map.current!);
    } else {
      markerRef.current.setLngLat([lon, lat]);
    }

    if (mode === 'live') {
      trailCoords.current.push([lon, lat]);
      if (trailCoords.current.length > 50) trailCoords.current.shift();
      if (trailSourceAdded.current && map.current) {
        const src = map.current.getSource('trail') as maplibregl.GeoJSONSource;
        src?.setData({
          type: 'FeatureCollection',
          features: trailCoords.current.length > 1 ? [{
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: trailCoords.current },
            properties: {},
          }] : [],
        });
      }
      map.current.easeTo({ center: [lon, lat], duration: 1200 });
    }
  }, [gpsData, mapReady, mode, cattle, hasGpsTracker]);

  // Initial fetch
  useEffect(() => { fetchGPS(); }, [fetchGPS]);

  // Auto refresh countdown (live mode)
  useEffect(() => {
    if (mode !== 'live' || !isAutoRefresh || !hasGpsTracker) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { fetchGPS(); return 30; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, isAutoRefresh, fetchGPS, hasGpsTracker]);

  if (!cattle) return null;

  const signalColor = isLostSignal ? '#ef4444' : gpsData && gpsData.signal > 60 ? '#22c55e' : '#f59e0b';
  const batteryColor = gpsData && gpsData.battery < 20 ? '#ef4444' : gpsData && gpsData.battery < 50 ? '#f59e0b' : '#22c55e';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0d1a11]/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl bg-[#0f1f16] rounded-[2rem] border border-[#1e3a28] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[96vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3a28] bg-gradient-to-r from-[#0f1f16] to-[#152a1e] shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#006B3F]/20 border border-[#006B3F]/30 flex items-center justify-center text-xl">🐄</div>
            <div>
              <h2 className="text-white font-black text-lg">{cattle.id}</h2>
              <p className="text-[#6b9e7e] text-xs">{cattle.name} • {hasGpsTracker ? 'GPS Tracker Kalung' : 'Tanpa GPS Tracker'}</p>
            </div>
            {/* Live badge */}
            {mode === 'live' && isAutoRefresh && hasGpsTracker && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-red-400 text-xs font-bold">LIVE</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Mode Switch */}
            {hasGpsTracker && (
              <div className="flex bg-[#1a2f22] rounded-xl p-1 border border-[#1e3a28]">
                <button
                  onClick={() => { setMode('live'); setIsAutoRefresh(true); setCountdown(30); trailCoords.current = []; }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'live' ? 'bg-red-500 text-white shadow-lg' : 'text-[#6b9e7e] hover:text-white'}`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  Live
                </button>
                <button
                  onClick={() => { setMode('current'); setIsAutoRefresh(false); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'current' ? 'bg-[#006B3F] text-white shadow-lg' : 'text-[#6b9e7e] hover:text-white'}`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Posisi Sekarang
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1a2f22] hover:bg-red-500/20 border border-[#1e3a28] hover:border-red-500/40 text-[#6b9e7e] hover:text-red-400 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          {/* Map */}
          <div className="flex-1 relative">
            <div ref={mapContainer} className="w-full h-full min-h-[450px]" style={{ background: '#0a1510' }} />
            
            {/* Map overlay controls */}
            <div className="absolute right-3 top-3 flex flex-col gap-2">
              <button onClick={() => map.current?.zoomIn()} className="w-9 h-9 bg-[#0f1f16]/90 backdrop-blur border border-[#1e3a28] rounded-xl flex items-center justify-center text-white hover:bg-[#1a2f22] transition-all">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button onClick={() => map.current?.zoomOut()} className="w-9 h-9 bg-[#0f1f16]/90 backdrop-blur border border-[#1e3a28] rounded-xl flex items-center justify-center text-white hover:bg-[#1a2f22] transition-all">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => gpsData && map.current?.flyTo({ center: [gpsData.lon, gpsData.lat], zoom: 17 })}
                className="w-9 h-9 bg-[#006B3F]/80 backdrop-blur border border-[#006B3F]/50 rounded-xl flex items-center justify-center text-white hover:bg-[#006B3F] transition-all"
                title="Ke posisi sapi"
              >
                <Navigation className="w-4 h-4" />
              </button>
            </div>

            {/* Signal lost overlay */}
            {isLostSignal && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0f1f16]/70 backdrop-blur-sm">
                <div className="text-center p-6 max-w-xs">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                    <WifiOff className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-white font-black text-lg mb-2">Signal Lemah / Terputus</h3>
                  <p className="text-[#6b9e7e] text-sm mb-4">
                    Sapi terdeteksi menjauh dari lokasi farm.<br />
                    Jarak saat ini: <span className="text-red-400 font-bold">{formatDistanceText(distanceFromFarm)}</span> dari Barbara Farm
                  </p>
                  <button
                    onClick={fetchGPS}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-xl font-bold mx-auto hover:bg-red-500/30 transition-all text-sm"
                  >
                    <RefreshCw className="w-4 h-4" /> Coba Refresh
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-[280px] border-t md:border-t-0 md:border-l border-[#1e3a28] flex flex-col overflow-y-auto shrink-0">
            {!hasGpsTracker ? (
              <div className="p-6 text-center space-y-4 my-auto">
                <div className="w-16 h-16 bg-[#006B3F]/10 border border-[#006B3F]/30 rounded-2xl flex items-center justify-center mx-auto text-3xl">🏞️</div>
                <h3 className="text-white font-black text-sm">Tanpa GPS Tracker</h3>
                <p className="text-[#6b9e7e] text-xs leading-relaxed">
                  Sapi ini belum dipasang atau didaftarkan GPS Tracker M20.
                </p>
                <div className="p-4 bg-[#1a2f22] border border-[#1e3a28] rounded-xl text-left text-[11px] text-[#6b9e7e] leading-relaxed space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#006B3F]" />
                    <span>Peternakan Flores, NTT</span>
                  </div>
                  <p>Menampilkan lokasi fisik asli Barbara Farm di Flores, NTT.</p>
                </div>
              </div>
            ) : (
              <>
                {/* GPS Stats */}
                <div className="p-4 space-y-3">
                  <p className="text-[#6b9e7e] text-[10px] font-bold uppercase tracking-widest">Status Perangkat</p>
                  
                  {/* Signal */}
                  <div className="flex items-center justify-between p-3 bg-[#1a2f22] rounded-xl border border-[#1e3a28]">
                    <div className="flex items-center gap-2">
                      <Signal className="w-4 h-4" style={{ color: signalColor }} />
                      <span className="text-white text-sm font-bold">Sinyal GPS</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black" style={{ color: signalColor }}>{gpsData?.signal ?? '--'}%</p>
                      <p className="text-[10px] text-[#4a7a5e]">{isLostSignal ? 'Lemah' : 'Baik'}</p>
                    </div>
                  </div>

                  {/* Battery */}
                  <div className="flex items-center justify-between p-3 bg-[#1a2f22] rounded-xl border border-[#1e3a28]">
                    <div className="flex items-center gap-2">
                      <Battery className="w-4 h-4" style={{ color: batteryColor }} />
                      <span className="text-white text-sm font-bold">Baterai Kalung</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black" style={{ color: batteryColor }}>{gpsData?.battery ?? '--'}%</p>
                      <div className="w-16 h-1.5 bg-[#0f1f16] rounded-full mt-1 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${gpsData?.battery ?? 0}%`, background: batteryColor }} />
                      </div>
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="flex items-center justify-between p-3 bg-[#1a2f22] rounded-xl border border-[#1e3a28]">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-orange-400" />
                      <span className="text-white text-sm font-bold">Suhu Tubuh</span>
                    </div>
                    <p className="text-orange-400 text-xs font-black">{gpsData?.temperature?.toFixed(1) ?? '--'}°C</p>
                  </div>
                </div>

                <div className="border-t border-[#1e3a28] p-4 space-y-3">
                  <p className="text-[#6b9e7e] text-[10px] font-bold uppercase tracking-widest">Koordinat GPS</p>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-[#1a2f22] rounded-xl border border-[#1e3a28]">
                      <p className="text-[10px] text-[#4a7a5e] mb-0.5">Latitude</p>
                      <p className="text-white font-mono text-sm font-bold">{gpsData?.lat.toFixed(6) ?? '--'}</p>
                    </div>
                    <div className="p-3 bg-[#1a2f22] rounded-xl border border-[#1e3a28]">
                      <p className="text-[10px] text-[#4a7a5e] mb-0.5">Longitude</p>
                      <p className="text-white font-mono text-sm font-bold">{gpsData?.lon.toFixed(6) ?? '--'}</p>
                    </div>
                    <div className="p-3 bg-[#1a2f22] rounded-xl border border-[#1e3a28]">
                      <p className="text-[10px] text-[#4a7a5e] mb-0.5">Akurasi</p>
                      <p className="text-white font-mono text-sm font-bold">±{gpsData?.accuracy.toFixed(1) ?? '--'} m</p>
                    </div>
                    <div className="p-3 bg-[#1a2f22] rounded-xl border border-[#1e3a28]">
                      <p className="text-[10px] text-[#4a7a5e] mb-0.5">Kecepatan Gerak</p>
                      <p className="text-white font-mono text-sm font-bold">{gpsData?.speed.toFixed(1) ?? '--'} km/h</p>
                    </div>
                  </div>

                  {/* Distance alert */}
                  {distanceFromFarm > 0 && (
                    <div className={`p-3 rounded-xl border flex items-start gap-2 ${distanceFromFarm > FARM_RADIUS_KM ? 'bg-red-500/10 border-red-500/30' : 'bg-[#006B3F]/10 border-[#006B3F]/30'}`}>
                      {distanceFromFarm > FARM_RADIUS_KM ? (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      ) : (
                        <MapPin className="w-4 h-4 text-[#4ade80] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`text-xs font-bold ${distanceFromFarm > FARM_RADIUS_KM ? 'text-red-400' : 'text-[#4ade80]'}`}>
                          {distanceFromFarm > FARM_RADIUS_KM ? '⚠️ Jauh dari Farm!' : '✅ Dalam Area Farm'}
                        </p>
                        <p className="text-[10px] text-[#4a7a5e]">Jarak: {formatDistanceText(distanceFromFarm)} dari HQ</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="border-t border-[#1e3a28] p-4 space-y-3 mt-auto">
                  {mode === 'live' ? (
                    <>
                      <button
                        onClick={() => setIsAutoRefresh(prev => !prev)}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border transition-all ${
                          isAutoRefresh
                            ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                            : 'bg-[#006B3F]/20 border-[#006B3F]/40 text-[#4ade80] hover:bg-[#006B3F]/30'
                        }`}
                      >
                        <Radio className="w-4 h-4" />
                        {isAutoRefresh ? `Auto Refresh (${countdown}s)` : 'Mulai Auto Refresh'}
                      </button>
                      <p className="text-center text-[10px] text-[#4a7a5e]">
                        {isAutoRefresh ? 'Refresh otomatis setiap 30 detik' : 'Auto refresh dinonaktifkan'}
                      </p>
                    </>
                  ) : (
                    <button
                      onClick={fetchGPS}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#006B3F]/20 border border-[#006B3F]/40 text-[#4ade80] rounded-xl font-bold text-sm hover:bg-[#006B3F]/30 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      {isLoading ? 'Memuat...' : 'Refresh Posisi'}
                    </button>
                  )}

                  {/* Last updated */}
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#4a7a5e]">
                    <Clock className="w-3 h-3" />
                    {lastUpdated ? `Update: ${lastUpdated.toLocaleTimeString('id-ID')}` : 'Belum ada data'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .cattle-pulse::after {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid rgba(34,197,94,0.5);
          animation: cattlePulse 2s ease-out infinite;
        }
        @keyframes cattlePulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
