"use client"

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Filter, Plus, Minus, Layers } from "lucide-react";

interface FarmMapProps {
  className?: string;
}

const API_KEY = 'AdOTwxEK8ksdIC8bFRRc';
const lon = 121.843059;
const lat = -8.67932;

const FarmMap: React.FC<FarmMapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const container = mapContainer.current;
    
    // Create a ResizeObserver to wait until the container has dimensions
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && !map.current) {
          // Initialize map with a style that doesn't require MapTiler key for development
          map.current = new maplibregl.Map({
            container: container,
            style: {
              version: 8,
              sources: {
                'raster-tiles': {
                  type: 'raster',
                  tiles: [
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                  ],
                  tileSize: 256,
                  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
                }
              },
              layers: [
                {
                  id: 'simple-tiles',
                  type: 'raster',
                  source: 'raster-tiles',
                  minzoom: 0,
                  maxzoom: 22
                }
              ]
            },
            center: [lon, lat],
            zoom: 17.5,
            pitch: 30,
            bearing: 0,
            attributionControl: false
          });

          map.current.on('load', () => {
            if (!map.current) return;
            
            // Re-center just to be sure
            map.current.setCenter([lon, lat]);
            map.current.resize();

            // Custom HTML Marker for Barbara Farm
            const el = document.createElement('div');
            el.className = 'farm-marker';
            el.innerHTML = `
              <div style="display: flex; flex-direction: column; align-items: center;">
                <div style="background-color: #006B3F; padding: 4px 12px; border-radius: 12px; border: 2px solid white; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); white-space: nowrap; margin-bottom: 4px;">
                  Barbara Farm
                </div>
                <div style="width: 12px; height: 12px; background-color: #006B3F; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
              </div>
            `;

            new maplibregl.Marker({ element: el, anchor: 'bottom' })
              .setLngLat([lon, lat])
              .addTo(map.current!);
          });
          
          // Once initialized, we don't need to observe anymore
          resizeObserver.disconnect();
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Additional effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (map.current) {
        map.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-bold">Peta Sebaran Sapi (Kandang)</CardTitle>
        <button className="flex items-center gap-2 px-4 py-2 border border-border-neutral rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </CardHeader>
      <CardContent>
        <div className="relative group">
          <div
            ref={mapContainer}
            className="w-full h-[400px] rounded-xl overflow-hidden border border-border-neutral"
          />

          {/* Custom Map Controls */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <div className="flex flex-col bg-white rounded-lg shadow-lg border border-border-neutral overflow-hidden">
              <button onClick={() => map.current?.zoomIn()} className="p-2 hover:bg-gray-100 border-b border-border-neutral"><Plus className="h-5 w-5 text-text-primary" /></button>
              <button onClick={() => map.current?.zoomOut()} className="p-2 hover:bg-gray-100"><Minus className="h-5 w-5 text-text-primary" /></button>
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
