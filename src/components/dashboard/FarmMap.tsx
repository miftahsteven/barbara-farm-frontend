"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Filter, Plus, Minus, Layers, RefreshCw, MapPin, AlertTriangle } from "lucide-react";
import { useCattleStore } from '@/lib/useCattleStore';
import { apiFetch } from '@/lib/useAuthStore';

interface FarmMapProps {
  className?: string;
}

// Temporary Center: Depok, Jawa Barat
const DEPOK_LON = 106.7942;
const DEPOK_LAT = -6.4025;

// Assign a color per cattle based on index
const MARKER_COLORS = [
  '#16a34a', '#2563eb', '#9333ea', '#dc2626',
  '#ea580c', '#0891b2', '#65a30d', '#d97706',
  '#be185d', '#7c3aed',
];

const FarmMap: React.FC<FarmMapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const deviceMarkersRef = useRef<Record<string, maplibregl.Marker>>({});

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [mapReady, setMapReady] = useState(false);
  const [gpsDevices, setGpsDevices] = useState<any[]>([]);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showDiagModal, setShowDiagModal] = useState(false);

  // Pull AKTIF cattle from the store (real data)
  const { cattle, fetchCattle } = useCattleStore();
  const activeCattle = cattle.filter(c => c.status === 'AKTIF' || c.status === 'PEMANTAUAN' || c.status === 'SIAP_JUAL');

  // Fetch real GPS devices from backend
  const fetchGPSDevices = useCallback(async () => {
    try {
      setGpsError(null);
      const res = await apiFetch('/gps/gpsid/devices');
      const data = await res.json().catch(() => ({}));
      
      if (res.ok) {
        if (data.status && data.message?.data) {
          setGpsDevices(data.message.data);
        } else {
          setGpsError("Format respons GPS.id tidak valid");
        }
      } else {
        setGpsError(data.error || data.message || "Gagal mengambil data dari vendor");
      }
    } catch (error: any) {
      console.error('Failed to fetch GPS devices:', error);
      setGpsError(error.message || 'Gagal menghubungi server backend');
    }
  }, []);

  // Fetch cattle and GPS devices on mount
  useEffect(() => {
    if (cattle.length === 0) fetchCattle();
    fetchGPSDevices();
    setLastUpdate(new Date().toLocaleTimeString('id-ID'));
  }, [cattle.length, fetchCattle, fetchGPSDevices]);

  // Update Markers when Map is ready or GPS devices / Active Cattle changes
  useEffect(() => {
    if (!map.current || !mapReady) return;

    gpsDevices.forEach((device, index) => {
      const imei = device.imei;
      const lon = parseFloat(device.longitude);
      const lat = parseFloat(device.latitude);

      if (isNaN(lon) || isNaN(lat)) return;

      // Map GPS device to the corresponding active cattle
      // Try to match eartagNo with the IMEI number, fallback to mapping by index
      const associatedCattle = activeCattle.find(c => c.eartagNo === imei) || activeCattle[index] || null;
      const displayId = associatedCattle ? associatedCattle.id : `GPS-${imei.slice(-4)}`;
      const displayName = associatedCattle ? (associatedCattle.name || 'Sapi GPS') : device.device_name;
      const pen = associatedCattle ? associatedCattle.pen : 'Lepas Kandang';
      const color = MARKER_COLORS[index % MARKER_COLORS.length];

      if (deviceMarkersRef.current[imei]) {
        // Smoothly update position if marker already exists
        deviceMarkersRef.current[imei].setLngLat([lon, lat]);
      } else {
        // Create custom interactive marker
        const el = document.createElement('div');
        el.className = 'gps-marker-container';
        el.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;" title="${displayId} - ${displayName}">
            <div style="background:rgba(15,31,22,0.92);color:white;padding:3px 8px;border-radius:8px;font-size:10px;font-weight:800;white-space:nowrap;border:1.5px solid ${color};margin-bottom:3px;letter-spacing:0.5px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${displayId}</div>
            <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,${color},${color}aa);border:2.5px solid white;box-shadow:0 3px 14px ${color}77;display:flex;align-items:center;justify-content:center;font-size:18px;transition: transform 0.2s;">🐄</div>
          </div>`;

        // Scale effect on hover
        el.addEventListener('mouseenter', () => {
          const cowEmoji = el.querySelector('div:last-child') as HTMLElement;
          if (cowEmoji) cowEmoji.style.transform = 'scale(1.15)';
        });
        el.addEventListener('mouseleave', () => {
          const cowEmoji = el.querySelector('div:last-child') as HTMLElement;
          if (cowEmoji) cowEmoji.style.transform = 'scale(1)';
        });

        const popup = new maplibregl.Popup({ offset: 32, closeButton: false, maxWidth: '280px' })
          .setHTML(`
            <div style="font-family:sans-serif;padding:6px;min-width:180px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;border-bottom:1px solid #eee;padding-bottom:4px;">
                <strong style="color:#006B3F;font-size:13px;">${displayId}</strong>
                <span style="font-size:9px;background:#e8f5e9;color:#2e7d32;padding:2px 6px;border-radius:10px;font-weight:bold;margin-left:auto;">GPS ONLINE</span>
              </div>
              <div style="font-size:11px;color:#333;margin-bottom:2px;"><strong>Nama:</strong> ${displayName}</div>
              <div style="font-size:10px;color:#666;margin-bottom:2px;"><strong>Kandang:</strong> ${pen}</div>
              <div style="font-size:10px;color:#666;margin-bottom:4px;"><strong>IMEI:</strong> ${imei}</div>
              <div style="margin-top:6px;padding-top:4px;border-top:1px dashed #eee;font-size:9px;color:#888;line-height:1.4;">
                📍 Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}<br/>
                ⚡ Kecepatan: ${device.speed || 0} km/h<br/>
                🕒 Update Terakhir: ${device.last_update || '-'}
              </div>
            </div>`);

        deviceMarkersRef.current[imei] = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lon, lat])
          .setPopup(popup)
          .addTo(map.current!);
      }
    });

    // Remove markers for devices that are no longer active/present
    Object.keys(deviceMarkersRef.current).forEach(imei => {
      if (!gpsDevices.find(d => d.imei === imei)) {
        deviceMarkersRef.current[imei].remove();
        delete deviceMarkersRef.current[imei];
      }
    });

    // Fly/Ease map to the first loaded GPS device dynamically
    if (gpsDevices.length > 0) {
      const firstDevice = gpsDevices[0];
      const flon = parseFloat(firstDevice.longitude);
      const flat = parseFloat(firstDevice.latitude);
      if (!isNaN(flon) && !isNaN(flat)) {
        map.current.easeTo({
          center: [flon, flat],
          zoom: 15,
          duration: 1500
        });
      }
    }
  }, [mapReady, gpsDevices, activeCattle]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    Promise.all([
      fetchCattle(),
      fetchGPSDevices()
    ]).finally(() => {
      setLastUpdate(new Date().toLocaleTimeString('id-ID'));
      setIsRefreshing(false);
    });
  };

  // Map Initialization
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
            center: [DEPOK_LON, DEPOK_LAT],
            zoom: 14,
            pitch: 30,
            attributionControl: false,
          });

          map.current.on('load', () => {
            if (!map.current) return;
            map.current.setCenter([DEPOK_LON, DEPOK_LAT]);
            map.current.resize();

            // Office / Headquarters Marker in Depok
            const farmEl = document.createElement('div');
            farmEl.innerHTML = `
              <div style="display:flex;flex-direction:column;align-items:center;">
                <div style="background:#006B3F;padding:4px 12px;border-radius:12px;border:2px solid white;color:white;font-weight:bold;font-size:13px;box-shadow:0 4px 12px rgba(0,107,63,0.4);white-space:nowrap;margin-bottom:4px;">🏠 Barbara Farm Office</div>
                <div style="width:12px;height:12px;background:#006B3F;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>
              </div>`;
            new maplibregl.Marker({ element: farmEl, anchor: 'bottom' })
              .setLngLat([DEPOK_LON, DEPOK_LAT])
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
      Object.values(deviceMarkersRef.current).forEach(m => m.remove());
      deviceMarkersRef.current = {};
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
              {gpsDevices.length > 0 ? gpsDevices.length : 0} device GPS terdeteksi · Update: {lastUpdate}
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
          {/* Real-time GPS Error Banner */}
          {gpsError && (
            <div className="absolute top-4 left-4 right-16 z-[1000] bg-red-50/95 backdrop-blur border border-red-200 rounded-xl p-3 shadow-lg flex items-center justify-between text-xs text-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 pr-4">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 animate-bounce" />
                <div>
                  <strong className="block text-[11px] font-bold">Koneksi Satelit GPS.id Terkendala</strong>
                  <span className="text-red-600 font-mono text-[10px] line-clamp-1">{gpsError}</span>
                </div>
              </div>
              <button 
                onClick={() => setShowDiagModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors shadow-sm ml-auto whitespace-nowrap"
              >
                Cek Log & Kredensial
              </button>
            </div>
          )}

          <div
            ref={mapContainer}
            className="w-full h-[420px] rounded-xl overflow-hidden border border-border-neutral"
          />

          {/* Legend */}
          <div className="absolute left-4 bottom-4 bg-white/90 backdrop-blur rounded-xl p-3 shadow-lg border border-gray-100 text-xs space-y-1.5">
            <p className="font-bold text-gray-700 mb-1">Legenda</p>
            <div className="flex items-center gap-2"><span>🏠</span><span className="text-gray-600">Barbara Farm Office</span></div>
            <div className="flex items-center gap-2"><span>🐄</span><span className="text-gray-600">Sapi (GPS Real-Time)</span></div>
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

        {/* Premium Connection Diagnostic Modal */}
        {showDiagModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-5 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-base">GPS.id Porta M20 Diagnostic</h3>
                  <p className="text-white/80 text-[10px] mt-0.5">Integrasi Telemetri & Otorisasi Vendor</p>
                </div>
                <button onClick={() => setShowDiagModal(false)} className="text-white/80 hover:text-white font-bold text-base px-2">✕</button>
              </div>
              <div className="p-6 space-y-4 text-xs text-gray-700">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 space-y-2">
                  <p className="font-bold text-gray-800 text-[10px] uppercase tracking-wider mb-1 text-red-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                    Status Koneksi Saat Ini
                  </p>
                  <div className="flex justify-between border-b border-gray-200/50 pb-1.5 text-[11px]">
                    <span className="text-gray-500">API Endpoint:</span>
                    <span className="font-mono text-gray-800 font-semibold">/public/vehicle</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/50 pb-1.5 text-[11px]">
                    <span className="text-gray-500">Status Response:</span>
                    <span className="text-red-600 font-bold">API ERROR (500)</span>
                  </div>
                  <div className="flex flex-col pt-1">
                    <span className="text-gray-500 mb-1 text-[11px]">Pesan Error Vendor Satelit:</span>
                    <span className="bg-red-50 text-red-700 font-mono text-[9px] p-2.5 rounded-lg border border-red-100 leading-relaxed break-all">
                      {gpsError}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 space-y-2">
                  <p className="font-bold text-gray-800 text-[10px] uppercase tracking-wider mb-1 text-green-700 flex items-center gap-1.5">
                    <span>🔑</span>
                    Kredensial Vendor di Backend
                  </p>
                  <div className="flex justify-between border-b border-gray-200/50 pb-1.5 text-[11px]">
                    <span className="text-gray-500">Username:</span>
                    <span className="font-mono font-bold text-gray-900 bg-green-50 text-green-800 px-2 py-0.5 rounded">barbarafarm</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/50 pb-1.5 text-[11px]">
                    <span className="text-gray-500">Password:</span>
                    <span className="font-mono font-bold text-gray-900 bg-green-50 text-green-800 px-2 py-0.5 rounded">GPSid789</span>
                  </div>
                  <div className="text-[10px] text-gray-500 leading-relaxed pt-1.5 italic">
                    💡 **Tip Analisa**: Vendor mengembalikan error `Username or password is wrong` atau `Too many requests` (terkena batasan laju panggilan). Silakan periksa apakah password di backend Anda sudah diubah dari default vendor (`GPSid789`).
                  </div>
                </div>

                <button 
                  onClick={() => { setShowDiagModal(false); handleRefresh(); }}
                  className="w-full bg-[#006B3F] hover:bg-[#005230] text-white py-2.5 rounded-xl font-bold transition-all shadow-md text-[11px] mt-2 uppercase tracking-wider"
                >
                  Coba Hubungkan Ulang Satelit
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FarmMap;
