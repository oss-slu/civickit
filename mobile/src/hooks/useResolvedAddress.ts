import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type LocationSource = {
  latitude: number;
  longitude: number;
  priority?: 'exif' | 'gps' | 'fallback'; // extensible for future sources
};

/**
 * Resolves a human-readable address from one or more location sources.
 * Sources are tried in order — first one that resolves wins.
 * 
 * Future use: pass EXIF-derived coords as the first source for higher accuracy.
 */
export function useResolvedAddress(sources: LocationSource[]): string {
  const [address, setAddress] = useState<string>('Loading location...');

  useEffect(() => {
    if (!sources.length) return;

    let cancelled = false;

    const resolve = async () => {
      for (const source of sources) {
        try {
          const geocode = await Location.reverseGeocodeAsync({
            latitude: source.latitude,
            longitude: source.longitude,
          });

          if (cancelled) return;

          if (geocode.length > 0) {
            const { streetNumber, street, city, region, postalCode} = geocode[0];
            const parts = [
                streetNumber && street ? `${streetNumber} ${street}` : street, 
                city, 
                region, 
                postalCode,].filter(Boolean);
            if (parts.length > 0) {
              setAddress(parts.slice(0, 4).join(', '));
              return; // first successful resolution wins
            }
          }
        } catch {
          // this source failed, try the next one
          continue;
        }
      }

      if (!cancelled) setAddress('Location unavailable');
    };

    resolve();
    return () => { cancelled = true; };
  }, []);  // sources are derived from the issue, stable for the lifetime of this screen

  return address;
}