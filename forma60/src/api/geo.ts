import { fetchJson, withTimeout } from './http';
import type { LocationSnapshot } from '../engine/types';

export type GeoResult = {
  location: LocationSnapshot;
  latitude: number;
  longitude: number;
};

export const FALLBACK_LOCATION: GeoResult = {
  location: { city: 'Вроцлав', countryCode: 'PL', resolved: false },
  latitude: 51.1079,
  longitude: 17.0385,
};

type IpWho = {
  success?: boolean;
  city?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
};

type IpApi = {
  city?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
};

export async function resolveLocation(): Promise<GeoResult> {
  try {
    const data = await withTimeout(
      fetchJson<IpWho>('https://ipwho.is/', 2500, { key: 'f60.geo' }),
      3000,
    );
    if (data && data.success !== false && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
      return {
        location: {
          city: data.city?.trim() || 'локация не определена',
          countryCode: (data.country_code || 'PL').toUpperCase(),
          resolved: Boolean(data.city),
        },
        latitude: data.latitude,
        longitude: data.longitude,
      };
    }
  } catch {
    /* try next provider */
  }

  try {
    const data = await withTimeout(
      fetchJson<IpApi>('https://ipapi.co/json/', 2500, { key: 'f60.geo.alt' }),
      3000,
    );
    if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
      return {
        location: {
          city: data.city?.trim() || 'локация не определена',
          countryCode: (data.country_code || 'PL').toUpperCase(),
          resolved: Boolean(data.city),
        },
        latitude: data.latitude,
        longitude: data.longitude,
      };
    }
  } catch {
    /* fall through */
  }

  return FALLBACK_LOCATION;
}
