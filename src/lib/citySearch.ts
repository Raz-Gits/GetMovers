export interface CityResult {
  city: string;
  state: string;
  zip: string;
}

const STATE_ABBREV: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR',
  California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE',
  Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID',
  Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS',
  Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS',
  Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK',
  Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT',
  Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV',
  Wisconsin: 'WI', Wyoming: 'WY',
};

interface OpenMeteoResult {
  name: string;
  admin1?: string;
  country_code?: string;
  postcodes?: string[];
  population?: number;
}

function getStateAbbrev(adminName: string): string {
  return STATE_ABBREV[adminName] || adminName;
}

export async function searchCities(query: string): Promise<CityResult[]> {
  if (query.length < 2) return [];

  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=15&language=en&format=json`
    );
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.results) return [];

    const seen = new Set<string>();
    const results: CityResult[] = [];

    for (const r of data.results as OpenMeteoResult[]) {
      if (r.country_code?.toUpperCase() !== 'US') continue;
      if (!r.admin1) continue;

      const state = getStateAbbrev(r.admin1);
      const key = `${r.name}-${state}`;
      if (seen.has(key)) continue;
      seen.add(key);

      results.push({
        city: r.name,
        state,
        zip: r.postcodes?.[0] || '',
      });

      if (results.length >= 8) break;
    }

    return results;
  } catch {
    return [];
  }
}

export async function searchCityState(query: string): Promise<CityResult[]> {
  const parts = query.split(',').map(s => s.trim());
  const city = parts[0];
  const stateInput = parts[1] || '';

  if (!city || city.length < 2) return [];

  let stateAbbrev = stateInput.toUpperCase();
  if (stateInput.length > 2) {
    stateAbbrev = STATE_ABBREV[stateInput] || stateInput.toUpperCase();
  }

  const reverseMap: Record<string, string> = {};
  for (const [full, abbrev] of Object.entries(STATE_ABBREV)) {
    reverseMap[abbrev] = full;
  }
  if (!reverseMap[stateAbbrev]) return [];

  try {
    const res = await fetch(
      `https://api.zippopotam.us/us/${stateAbbrev}/${encodeURIComponent(city)}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.places || []).slice(0, 8).map((p: Record<string, string>) => ({
      zip: p['post code'],
      city: p['place name'],
      state: data['state abbreviation'] || stateAbbrev,
    }));
  } catch {
    return [];
  }
}
