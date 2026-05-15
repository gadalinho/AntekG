import { memo, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { COUNTRIES } from '@/data';
import { ISO_TO_NUMERIC, NUMERIC_TO_ISO, CONTINENT_COLORS } from '@/utils/isoMapping';
import type { Country } from '@/types/Country';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface WorldMapProps {
  visitedCountries: string[];
  selectedContinent: string | null;
  onCountrySelect: (country: Country) => void;
}

// Mapa id → kraj, zbudowana raz
const COUNTRY_MAP = new Map(COUNTRIES.map(c => [c.isoCode, c]));

export const WorldMap = memo(function WorldMap({
  visitedCountries,
  selectedContinent,
  onCountrySelect,
}: WorldMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  function getCountryColor(isoCode: string, isVisited: boolean, isHovered: boolean): string {
    const country = COUNTRY_MAP.get(isoCode);
    if (!country) return '#2a4a7a'; // nieznany kraj — granat

    if (selectedContinent && country.continent !== selectedContinent) {
      return '#1e3a6a'; // przyciemniony gdy filtr
    }

    if (isHovered) return '#FFD93D';
    if (isVisited) return '#7FB069';

    return CONTINENT_COLORS[country.continent] ?? '#3a5a8a';
  }

  function handleCountryClick(numericId: string) {
    const isoCode = NUMERIC_TO_ISO[Number(numericId)];
    if (!isoCode) return;
    const country = COUNTRY_MAP.get(isoCode);
    if (country) onCountrySelect(country);
  }

  return (
    <div className="w-full h-full" role="img" aria-label="Interaktywna mapa świata">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 120, center: [10, 20] }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={4}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const numId = String(geo.id);
                const isoCode = NUMERIC_TO_ISO[Number(numId)] ?? '';
                const isAvailable = ISO_TO_NUMERIC[isoCode] !== undefined;
                const isVisited = visitedCountries.includes(COUNTRY_MAP.get(isoCode)?.id ?? '');
                const isHovered = hoveredId === numId;
                const fill = getCountryColor(isoCode, isVisited, isHovered);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke={isVisited ? '#FFD93D' : '#0f2a4a'}
                    strokeWidth={isVisited ? 1.5 : 0.5}
                    style={{
                      default: { outline: 'none', cursor: isAvailable ? 'pointer' : 'default' },
                      hover: { outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                    onClick={() => isAvailable && handleCountryClick(numId)}
                    onMouseEnter={() => isAvailable && setHoveredId(numId)}
                    onMouseLeave={() => setHoveredId(null)}
                    role={isAvailable ? 'button' : undefined}
                    aria-label={
                      isAvailable ? `Kraj: ${COUNTRY_MAP.get(isoCode)?.namePL}` : undefined
                    }
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
});
