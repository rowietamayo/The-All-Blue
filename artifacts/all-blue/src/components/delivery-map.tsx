import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface DeliveryAddress {
  building: string;
  street: string;
  city: string;
  zipCode: string;
  lat: number | null;
  lng: number | null;
  formatted: string;
}

interface Props {
  value: DeliveryAddress;
  onChange: (addr: DeliveryAddress) => void;
}

export function DeliveryMap({ value, onChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [14.5995, 120.9842],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on("click", async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      setGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json() as {
          address?: {
            house_number?: string;
            road?: string;
            city?: string;
            town?: string;
            municipality?: string;
            postcode?: string;
            country?: string;
          };
          display_name?: string;
        };

        const addr = data.address ?? {};
        onChange({
          building: value.building || addr.house_number || "",
          street: addr.road || value.street,
          city: addr.city || addr.town || addr.municipality || value.city,
          zipCode: addr.postcode || value.zipCode,
          lat,
          lng,
          formatted: [
            value.building || addr.house_number,
            addr.road,
            addr.city || addr.town || addr.municipality,
            addr.postcode,
          ]
            .filter(Boolean)
            .join(", "),
        });
      } catch {
        onChange({ ...value, lat, lng });
      } finally {
        setGeocoding(false);
      }
    });

    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
      markerRef.current = null;
    };
  }, []);

  const buildFormatted = (next: Partial<DeliveryAddress>) => {
    const merged = { ...value, ...next };
    return [merged.building, merged.street, merged.city, merged.zipCode]
      .filter(Boolean)
      .join(", ");
  };

  const update = (field: keyof DeliveryAddress, val: string) => {
    const next = { ...value, [field]: val, formatted: buildFormatted({ [field]: val }) };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
            Bldg / Unit No.
          </label>
          <Input
            placeholder="e.g. Unit 4B"
            value={value.building}
            onChange={e => update("building", e.target.value)}
            className="bg-background focus-visible:ring-accent text-sm"
            data-testid="input-building"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
            Zip Code
          </label>
          <Input
            placeholder="e.g. 1000"
            value={value.zipCode}
            onChange={e => update("zipCode", e.target.value)}
            className="bg-background focus-visible:ring-accent text-sm"
            data-testid="input-zipcode"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
          Street Name
        </label>
        <Input
          placeholder="e.g. Baratie Lane"
          value={value.street}
          onChange={e => update("street", e.target.value)}
          className="bg-background focus-visible:ring-accent text-sm"
          data-testid="input-street"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
          City
        </label>
        <Input
          placeholder="e.g. Manila"
          value={value.city}
          onChange={e => update("city", e.target.value)}
          className="bg-background focus-visible:ring-accent text-sm"
          data-testid="input-city"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            Pin Your Location
          </label>
          {geocoding && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Locating...
            </span>
          )}
          {value.lat && !geocoding && (
            <span className="text-xs text-green-600 font-medium">Pinned</span>
          )}
        </div>
        <div
          ref={mapRef}
          className="w-full h-52 rounded-xl border border-border overflow-hidden"
          style={{ zIndex: 0 }}
          data-testid="delivery-map"
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          Click anywhere on the map to pin your exact delivery location. Address fields will auto-fill.
        </p>
      </div>
    </div>
  );
}
