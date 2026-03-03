export interface ZipEntry {
  zip: string;
  city: string;
  state: string;
}

type ZipData = Record<string, { city: string; state: string }>;

let zipData: ZipData | null = null;
let zipKeys: string[] | null = null;
let loadPromise: Promise<void> | null = null;

async function ensureLoaded(): Promise<void> {
  if (zipData) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const module = await import('../data/zipcodes.json');
    zipData = module.default as ZipData;
    zipKeys = Object.keys(zipData).sort();
  })();

  return loadPromise;
}

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function searchByZipPrefix(prefix: string, limit = 8): Promise<ZipEntry[]> {
  await ensureLoaded();
  if (!zipData || !zipKeys) return [];

  const results: ZipEntry[] = [];

  let lo = 0;
  let hi = zipKeys.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (zipKeys[mid] < prefix) lo = mid + 1;
    else hi = mid - 1;
  }

  for (let i = lo; i < zipKeys.length && results.length < limit; i++) {
    const key = zipKeys[i];
    if (!key.startsWith(prefix)) break;
    const entry = zipData[key];
    results.push({
      zip: key,
      city: titleCase(entry.city),
      state: entry.state,
    });
  }

  return results;
}

export async function lookupZip(zip: string): Promise<ZipEntry | null> {
  await ensureLoaded();
  if (!zipData) return null;

  const entry = zipData[zip];
  if (!entry) return null;

  return {
    zip,
    city: titleCase(entry.city),
    state: entry.state,
  };
}
