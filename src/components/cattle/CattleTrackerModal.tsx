'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Cattle } from '@/lib/useCattleStore';
import { apiFetch } from '@/lib/useAuthStore';
import { toast } from 'sonner';
import {
  X, MapPin, Wifi, WifiOff, RefreshCw, Radio, ZoomIn, ZoomOut,
  Navigation, Clock, AlertTriangle, Signal, Battery, Thermometer
} from 'lucide-react';

interface CattleTrackerModalProps {
  cattle: Cattle | null;
  onClose: () => void;
  initialMode?: 'live' | 'current' | 'history';
}

// Farm HQ location
const FARM_LON = 121.843059;
const FARM_LAT = -8.67932;
const DEPOK_LON = 106.83416;
const DEPOK_LAT = -6.36672;
const FARM_RADIUS_KM = 2; // alert if > 2km from farm

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

export const CattleTrackerModal: React.FC<CattleTrackerModalProps> = ({ cattle, onClose, initialMode }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const farmMarkerRef = useRef<maplibregl.Marker | null>(null);
  const historyStartMarkerRef = useRef<maplibregl.Marker | null>(null);
  const historyEndMarkerRef = useRef<maplibregl.Marker | null>(null);
  const trailSourceAdded = useRef(false);
  const trailCoords = useRef<[number, number][]>([]);

  const [mode, setMode] = useState<'live' | 'current' | 'history'>('live');
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

  // History states
  const [historyStart, setHistoryStart] = useState<string>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 16); // format YYYY-MM-DDTHH:mm
  });
  const [historyEnd, setHistoryEnd] = useState<string>(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.toISOString().slice(0, 16);
  });
  const [historyPoints, setHistoryPoints] = useState<any[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  // Handle initialMode sync
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
      if (initialMode !== 'live') {
        setIsAutoRefresh(false);
      } else {
        setIsAutoRefresh(true);
        setCountdown(30);
      }
    }
  }, [initialMode]);

  const fetchGPS = useCallback(async (forceRefresh = false) => {
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
      const res = await apiFetch(`/gps/gpsid/devices/${imei}${forceRefresh ? '?refresh=true' : ''}`);
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
        const errMsg = result.message || 'Gagal mengambil data koordinat GPS terupdate dari server.';
        toast.error(errMsg);
      }
    } catch (error) {
      console.error("Error fetching live GPS data:", error);
      toast.error('Gagal memproses data GPS dari server.');
    } finally {
      setIsLoading(false);
    }
  }, [cattle]);

  // Fetch History method
  const fetchHistory = useCallback(async () => {
    if (!cattle) return;
    const imei = cattle.eartagNo;
    const isRealIMEI = imei && /^\d{15}$/.test(imei);

    if (!isRealIMEI) {
      // Mock history for demo if no real IMEI exists
      setIsFetchingHistory(true);
      setTimeout(() => {
        const hqLon = FARM_LON;
        const hqLat = FARM_LAT;
        
        const mockPoints = [];
        for (let i = 0; i < 20; i++) {
          const angle = (i * 0.35) % (2 * Math.PI);
          const radius = 0.0006 + (i * 0.00009);
          const pLat = hqLat + Math.sin(angle) * radius;
          const pLon = hqLon + Math.cos(angle) * radius;
          
          mockPoints.push({
            latitude: pLat.toString(),
            longitude: pLon.toString(),
            speed: (0.5 + Math.random() * 2.5).toFixed(1),
            gps_time: new Date(Date.now() - (20 - i) * 20 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
            gsm_signal: "4",
            battery: (85 - i * 0.5).toFixed(0),
          });
        }
        
        setHistoryPoints(mockPoints);
        setIsFetchingHistory(false);
        toast.info('Menampilkan simulasi history pergerakan Flores HQ (Offline Demo)');
      }, 800);
      return;
    }

    setIsFetchingHistory(true);
    try {
      // Inputs are YYYY-MM-DDTHH:mm
      const startFormatted = historyStart.replace('T', ' ') + ':00';
      const endFormatted = historyEnd.replace('T', ' ') + ':59';

      const res = await apiFetch(`/gps/gpsid/history/${imei}?start=${encodeURIComponent(startFormatted)}&end=${encodeURIComponent(endFormatted)}&page=1&per_page=500`);
      const result = await res.json().catch(() => ({}));

      if (res.ok && result.status && result.message?.data) {
        const pts = Array.isArray(result.message.data) ? result.message.data : [];
        const normalized = pts.map((p: any) => {
          const lat = p.latitude || p.lat || '';
          const lon = p.longitude || p.lon || p.lng || '';
          const time = p.gps_time || p.timestamp || p.created_at || p.time || '';
          const spd = p.speed !== undefined ? p.speed : '0';
          const bat = p.battery !== undefined ? p.battery : '80';
          return {
            ...p,
            latitude: typeof lat === 'number' ? lat.toString() : String(lat),
            longitude: typeof lon === 'number' ? lon.toString() : String(lon),
            gps_time: typeof time === 'string' ? time : '',
            speed: typeof spd === 'number' ? spd.toString() : String(spd),
            battery: typeof bat === 'number' ? bat.toString() : String(bat),
          };
        });
        setHistoryPoints(normalized);
        if (normalized.length === 0) {
          toast.info('Tidak ada data history untuk rentang waktu ini.');
        } else {
          toast.success(`Berhasil memuat ${normalized.length} titik riwayat pergerakan.`);
        }
      } else if (res.ok && Array.isArray(result.data)) {
        const normalized = result.data.map((p: any) => {
          const lat = p.latitude || p.lat || '';
          const lon = p.longitude || p.lon || p.lng || '';
          const time = p.gps_time || p.timestamp || p.created_at || p.time || '';
          const spd = p.speed !== undefined ? p.speed : '0';
          const bat = p.battery !== undefined ? p.battery : '80';
          return {
            ...p,
            latitude: typeof lat === 'number' ? lat.toString() : String(lat),
            longitude: typeof lon === 'number' ? lon.toString() : String(lon),
            gps_time: typeof time === 'string' ? time : '',
            speed: typeof spd === 'number' ? spd.toString() : String(spd),
            battery: typeof bat === 'number' ? bat.toString() : String(bat),
          };
        });
        setHistoryPoints(normalized);
      } else {
        setHistoryPoints([]);
        toast.error(result.message || 'Tidak ada data history untuk rentang waktu ini.');
      }
    } catch (error) {
      console.error("Error fetching GPS history:", error);
      toast.error('Gagal mengambil history GPS dari server.');
    } finally {
      setIsFetchingHistory(false);
    }
  }, [cattle, historyStart, historyEnd]);

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
      if (historyStartMarkerRef.current) historyStartMarkerRef.current.remove();
      if (historyEndMarkerRef.current) historyEndMarkerRef.current.remove();
    };
  }, [gpsData]);

  // Update marker and map bounds when gpsData or mode changes
  useEffect(() => {
    if (!gpsData || !map.current || !mapReady) return;
    
    // Clear history markers when not in history mode
    if (mode !== 'history') {
      if (historyStartMarkerRef.current) {
        historyStartMarkerRef.current.remove();
        historyStartMarkerRef.current = null;
      }
      if (historyEndMarkerRef.current) {
        historyEndMarkerRef.current.remove();
        historyEndMarkerRef.current = null;
      }
    }

    if (mode === 'history') return; // History mode has its own drawing effect

    const { lat, lon } = gpsData;

    if (!hasGpsTracker) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (trailSourceAdded.current && map.current) {
        const src = map.current.getSource('trail') as maplibregl.GeoJSONSource;
        src?.setData({ type: 'FeatureCollection', features: [] });
      }
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

    if (mode === 'live' || mode === 'current') {
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
      } else {
        // Clear active trail in current mode
        if (trailSourceAdded.current && map.current) {
          const src = map.current.getSource('trail') as maplibregl.GeoJSONSource;
          src?.setData({ type: 'FeatureCollection', features: [] });
        }
      }
      
      // Center the map to the cow's position (works for BOTH Live and Posisi Sekarang modes)
      map.current.easeTo({ center: [lon, lat], duration: 1200 });
    }
  }, [gpsData, mapReady, mode, cattle, hasGpsTracker]);

  // Draw History Trail and adjust viewport bounds
  useEffect(() => {
    if (mode !== 'history' || !map.current || !mapReady) return;

    if (historyPoints.length === 0) {
      if (trailSourceAdded.current && map.current) {
        const src = map.current.getSource('trail') as maplibregl.GeoJSONSource;
        src?.setData({ type: 'FeatureCollection', features: [] });
      }
      return;
    }

    const coords: [number, number][] = historyPoints.map(p => [
      parseFloat(p.longitude),
      parseFloat(p.latitude)
    ] as [number, number]).filter(c => !isNaN(c[0]) && !isNaN(c[1]));

    if (coords.length === 0) return;

    // Draw solid path line
    if (trailSourceAdded.current && map.current) {
      const src = map.current.getSource('trail') as maplibregl.GeoJSONSource;
      src?.setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: coords },
          properties: {},
        }],
      });
      // Solid styling for history trail
      map.current.setPaintProperty('trail-line', 'line-dasharray', null);
      map.current.setPaintProperty('trail-line', 'line-color', '#38bdf8');
    }

    const latest = coords[coords.length - 1]!;

    // Cow marker at the end
    if (markerRef.current) {
      markerRef.current.setLngLat(latest);
    } else {
      const el = document.createElement('div');
      el.style.cssText = 'cursor:pointer;';
      el.innerHTML = `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
          <div style="position:absolute;top:-30px;left:50%;transform:translateX(-50%);background:rgba(17,33,27,0.85);backdrop-filter:blur(8px);color:white;padding:3px 8px;border-radius:8px;font-size:10px;font-weight:bold;white-space:nowrap;border:1px solid rgba(255,255,255,0.15);">${cattle?.id}</div>
          <div class="cattle-pulse" style="position:relative;width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#0284c7,#0369a1);border:3px solid white;box-shadow:0 4px 16px rgba(2,132,199,0.5);display:flex;align-items:center;justify-content:center;font-size:22px;">🐄</div>
        </div>
      `;
      markerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(latest)
        .addTo(map.current!);
    }

    // Start Pin (Green)
    const startCoord = coords[0]!;
    if (historyStartMarkerRef.current) {
      historyStartMarkerRef.current.remove();
    }
    const startEl = document.createElement('div');
    startEl.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="background:#22c55e;padding:2px 6px;border-radius:8px;color:white;font-weight:bold;font-size:9px;box-shadow:0 2px 6px rgba(34,197,94,0.4);margin-bottom:2px;">MULAI</div>
        <div style="width:10px;height:10px;background:#22c55e;border:2px solid white;border-radius:50%;"></div>
      </div>`;
    historyStartMarkerRef.current = new maplibregl.Marker({ element: startEl, anchor: 'bottom' })
      .setLngLat(startCoord)
      .addTo(map.current!);

    // End Pin (Red)
    if (historyEndMarkerRef.current) {
      historyEndMarkerRef.current.remove();
    }
    const endEl = document.createElement('div');
    endEl.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="background:#ef4444;padding:2px 6px;border-radius:8px;color:white;font-weight:bold;font-size:9px;box-shadow:0 2px 6px rgba(239,68,68,0.4);margin-bottom:2px;">SELESAI</div>
        <div style="width:10px;height:10px;background:#ef4444;border:2px solid white;border-radius:50%;"></div>
      </div>`;
    historyEndMarkerRef.current = new maplibregl.Marker({ element: endEl, anchor: 'bottom' })
      .setLngLat(latest)
      .addTo(map.current!);

    // Fit map bounds to encompass the entire history route beautifully
    const bounds = coords.reduce((acc, coord) => {
      return acc.extend(coord);
    }, new maplibregl.LngLatBounds(coords[0], coords[0]));
    map.current.fitBounds(bounds, { padding: 50, duration: 1200 });

  }, [historyPoints, mode, mapReady, cattle]);

  // Initial fetch
  useEffect(() => { fetchGPS(); }, [fetchGPS]);

  // Auto refresh countdown (live mode - 5 SECONDS once)
  useEffect(() => {
    if (mode !== 'live' || !isAutoRefresh || !hasGpsTracker) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { 
          fetchGPS(true); // pass true to bypass backend cache
          return 30; 
        }
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
                <span className="text-red-400 text-xs font-bold">LIVE (5s)</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Mode Switch */}
            {hasGpsTracker && (
              <div className="flex bg-[#1a2f22] rounded-xl p-1 border border-[#1e3a28]">
                <button
                  onClick={() => { setMode('live'); setIsAutoRefresh(true); setCountdown(5); trailCoords.current = []; }}
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
                <button
                  onClick={() => { setMode('history'); setIsAutoRefresh(false); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'history' ? 'bg-[#0284c7] text-white shadow-lg' : 'text-[#6b9e7e] hover:text-white'}`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  History
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
                onClick={() => {
                  if (mode === 'history' && historyPoints.length > 0) {
                    const coords = historyPoints.map(p => [parseFloat(p.longitude), parseFloat(p.latitude)]);
                    const bounds = coords.reduce((acc, coord) => acc.extend(coord as any), new maplibregl.LngLatBounds(coords[0] as any, coords[0] as any));
                    map.current?.fitBounds(bounds, { padding: 50, duration: 1200 });
                  } else if (gpsData) {
                    map.current?.flyTo({ center: [gpsData.lon, gpsData.lat], zoom: 17 });
                  }
                }}
                className="w-9 h-9 bg-[#006B3F]/80 backdrop-blur border border-[#006B3F]/50 rounded-xl flex items-center justify-center text-white hover:bg-[#006B3F] transition-all"
                title="Pusatkan Peta"
              >
                <Navigation className="w-4 h-4" />
              </button>
            </div>

            {/* Signal lost overlay */}
            {isLostSignal && mode !== 'history' && (
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
                    onClick={() => fetchGPS(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-xl font-bold mx-auto hover:bg-red-500/30 transition-all text-sm"
                  >
                    <RefreshCw className="w-4 h-4" /> Coba Refresh
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-[280px] border-t md:border-t-0 md:border-l border-[#1e3a28] flex flex-col overflow-hidden shrink-0 bg-[#0c1912]">
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
                {/* Switchable Sidebar contents */}
                {mode === 'history' ? (
                  <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[#0f1f16]/40">
                    {/* History Filters */}
                    <div className="p-4 space-y-4 shrink-0 border-b border-[#1e3a28]">
                      <p className="text-[#6b9e7e] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#0284c7]" />
                        <span>Filter Riwayat</span>
                      </p>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#4a7a5e] block mb-1 font-bold">Waktu Mulai</label>
                          <input
                            type="datetime-local"
                            value={historyStart}
                            onChange={(e) => setHistoryStart(e.target.value)}
                            className="w-full bg-[#1a2f22] border border-[#1e3a28] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#0284c7] font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#4a7a5e] block mb-1 font-bold">Waktu Selesai</label>
                          <input
                            type="datetime-local"
                            value={historyEnd}
                            onChange={(e) => setHistoryEnd(e.target.value)}
                            className="w-full bg-[#1a2f22] border border-[#1e3a28] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#0284c7] font-bold"
                          />
                        </div>
                        
                        <button
                          onClick={fetchHistory}
                          disabled={isFetchingHistory}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-[#0284c7]/20 border border-[#0284c7]/40 text-[#38bdf8] hover:bg-[#0284c7]/35 rounded-xl font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <Clock className={`w-3.5 h-3.5 ${isFetchingHistory ? 'animate-spin' : ''}`} />
                          {isFetchingHistory ? 'Memuat Riwayat...' : 'Tampilkan Riwayat'}
                        </button>
                      </div>
                    </div>

                    {/* History Points Log */}
                    <div className="flex-1 flex flex-col p-4 overflow-hidden min-h-0">
                      <p className="text-[#6b9e7e] text-[10px] font-bold uppercase tracking-widest mb-3 shrink-0">
                        Rute Perjalanan ({historyPoints.length})
                      </p>
                      
                      {historyPoints.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-[#4a7a5e] text-xs border border-dashed border-[#1e3a28] rounded-xl">
                          <MapPin className="w-8 h-8 text-[#1e3a28] mb-2 animate-bounce" />
                          <span>Belum ada data.<br/>Pilih waktu dan klik Tampilkan.</span>
                        </div>
                      ) : (
                        <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
                          {historyPoints.map((p, idx) => {
                            const timeStr = p.gps_time || p.timestamp || p.created_at || '';
                            const displayTime = typeof timeStr === 'string' && timeStr.length >= 10 
                              ? (timeStr.includes(' ') ? timeStr.split(' ')[1]?.slice(0, 5) : timeStr.slice(11, 16)) || '--:--'
                              : '--:--';
                            const displayDate = typeof timeStr === 'string' 
                              ? (timeStr.includes(' ') ? timeStr.split(' ')[0] : timeStr.slice(0, 10)) || '---'
                              : '---';
                            return (
                              <div 
                                key={idx} 
                                onClick={() => {
                                  const lon = parseFloat(p.longitude);
                                  const lat = parseFloat(p.latitude);
                                  if (!isNaN(lon) && !isNaN(lat)) {
                                    map.current?.flyTo({ center: [lon, lat], zoom: 18 });
                                  } else {
                                    toast.error('Koordinat GPS tidak valid');
                                  }
                                }}
                                className="p-3 bg-[#1a2f22]/60 hover:bg-[#1a2f22] border border-[#1e3a28]/60 hover:border-[#0284c7]/40 rounded-xl text-[10px] leading-relaxed cursor-pointer transition-all flex flex-col gap-1"
                              >
                                <div className="flex justify-between text-white font-bold">
                                  <span>Titik #{historyPoints.length - idx}</span>
                                  <span className="text-[#38bdf8]">{displayTime}</span>
                                </div>
                                <p className="text-[#6b9e7e] text-[9px] font-mono leading-none">
                                  {displayDate}
                                </p>
                                <div className="text-[#4a7a5e] font-mono text-[9px]">
                                  Lat: {parseFloat(p.latitude).toFixed(5)} | Lon: {parseFloat(p.longitude).toFixed(5)}
                                </div>
                                <div className="flex justify-between text-[#6b9e7e] text-[8.5px] mt-0.5 border-t border-[#1e3a28]/40 pt-1">
                                  <span>Kec: {p.speed || '0'} km/h</span>
                                  <span>Bat: {p.battery || '--'}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                    {/* Scrollable container for stats & coordinates */}
                    <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
                      {/* GPS Stats (Live and Current modes) */}
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
                    </div>

                    {/* Controls */}
                    <div className="border-t border-[#1e3a28] p-4 space-y-3 shrink-0 bg-[#0c1912]">
                      {mode === 'live' ? (
                        <>
                          <button
                            onClick={() => setIsAutoRefresh(prev => !prev)}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border transition-all ${
                              isAutoRefresh
                                ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30 cursor-pointer'
                                : 'bg-[#006B3F]/20 border-[#006B3F]/40 text-[#4ade80] hover:bg-[#006B3F]/30 cursor-pointer'
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
                          onClick={() => fetchGPS(true)}
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-[#006B3F]/20 border border-[#006B3F]/40 text-[#4ade80] rounded-xl font-bold text-sm hover:bg-[#006B3F]/30 transition-all disabled:opacity-50 cursor-pointer"
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
                  </div>
                )}
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
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
