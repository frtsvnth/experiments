import { fetchJson, withTimeout } from './http';
import { fallbackHoliday } from '../data/holidaysFallback';
import type { HolidaySnapshot } from '../engine/types';

type NagerHoliday = {
  date?: string;
  localName?: string;
  name?: string;
  countryCode?: string;
  global?: boolean;
  types?: string[];
};

export async function resolveHoliday(
  countryCode: string,
  isoDate: string,
): Promise<HolidaySnapshot | null> {
  const code = countryCode === 'RU' ? 'RU' : countryCode === 'PL' ? 'PL' : null;
  if (code) {
    const year = isoDate.slice(0, 4);
    try {
      const list = await withTimeout(
        fetchJson<NagerHoliday[]>(
          `https://date.nager.at/api/v3/PublicHolidays/${year}/${code}`,
          2500,
          { key: `f60.holidays.${code}.${year}` },
        ),
        3000,
      );
      const match = list.find((entry) => entry.date === isoDate);
      if (match) {
        return {
          name: match.name || match.localName || 'праздник',
          localName: match.localName ?? null,
          isPublic: match.global !== false,
        };
      }
    } catch {
      /* fall back to the bundled calendar */
    }
  }

  const local = fallbackHoliday(countryCode, isoDate);
  if (!local) return null;
  return { name: local.name, localName: local.localName, isPublic: true };
}

export function isHolidayKnown(
  countryCode: string,
  isoDate: string,
): HolidaySnapshot | null {
  const local = fallbackHoliday(countryCode, isoDate);
  return local ? { name: local.name, localName: local.localName, isPublic: true } : null;
}
