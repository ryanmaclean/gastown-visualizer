// IPv4 /8 allocation registry (compact)
// Source: IANA IPv4 Address Space Registry, with hat-tip to CAIDA / ISI ANT
// for the broader practice of routed-space cartography (xkcd #195 style).
// One entry per /8 (0..255). `cat` drives the color in InternetMap.tsx.

export type AllocationCategory =
  | 'reserved'   // 0.0.0.0/8, 240-255 future use, 255 broadcast
  | 'private'    // 10/8
  | 'loopback'   // 127/8
  | 'cgnat'      // 100.64/10 lives inside 100/8
  | 'multicast'  // 224-239
  | 'legacy'     // pre-RIR /8s assigned directly to orgs/govs
  | 'arin'       // North America
  | 'ripe'       // Europe / Middle East
  | 'apnic'      // Asia-Pacific
  | 'lacnic'     // Latin America & Caribbean
  | 'afrinic';   // Africa

export interface Allocation {
  block: number;          // 0..255
  cidr: string;           // "10.0.0.0/8"
  cat: AllocationCategory;
  label: string;          // short display label
  org?: string;           // owner / RIR
}

// Selected legacy /8 callouts (well-known holders). Anything not listed in
// the legacy map falls back to its RIR per IANA's modern delegation table.
const LEGACY: Record<number, { label: string; org: string }> = {
  3: { label: 'GE', org: 'General Electric' },
  4: { label: 'BBN', org: 'Level 3 / CenturyLink' },
  6: { label: 'ARMY', org: 'US Army ISC' },
  8: { label: 'L3', org: 'Level 3' },
  9: { label: 'IBM', org: 'IBM' },
  11: { label: 'DoD', org: 'US DoD Intel Info Sys' },
  12: { label: 'AT&T', org: 'AT&T Bell Labs' },
  13: { label: 'XRX', org: 'Xerox' },
  15: { label: 'HP', org: 'Hewlett-Packard' },
  16: { label: 'DEC', org: 'Digital / HP' },
  17: { label: 'APPL', org: 'Apple' },
  18: { label: 'MIT', org: 'MIT' },
  19: { label: 'FORD', org: 'Ford' },
  20: { label: 'CSC', org: 'Computer Sciences Corp' },
  21: { label: 'DDN', org: 'DDN-RVN' },
  22: { label: 'DISA', org: 'DISA' },
  26: { label: 'DISA', org: 'DISA' },
  28: { label: 'DSI', org: 'DSI-North' },
  29: { label: 'DISA', org: 'DISA' },
  30: { label: 'DISA', org: 'DISA' },
  33: { label: 'DLA', org: 'Defense Logistics Agency' },
  34: { label: 'HAL', org: 'Halliburton' },
  35: { label: 'MERIT', org: 'MERIT' },
  38: { label: 'PSI', org: 'PSINet / Cogent' },
  40: { label: 'ELI', org: 'Eli Lilly' },
  44: { label: 'AMPR', org: 'Amateur Radio Digital Comms' },
  48: { label: 'BELL', org: 'Bell-North' },
  53: { label: 'CAP', org: 'Cap Debis CCS' },
  54: { label: 'MERCK', org: 'Merck' },
  56: { label: 'USPS', org: 'US Postal Service' },
  57: { label: 'SITA', org: 'SITA' },
};

// Modern /8 → RIR (post-2010ish exhaustion-era delegations).
// Trimmed to keep this file small; unspecified /8s fall back to ARIN.
const RIR: Record<number, AllocationCategory> = {
  // RIPE
  2: 'ripe', 5: 'ripe', 31: 'ripe', 37: 'ripe', 46: 'ripe', 62: 'ripe',
  77: 'ripe', 78: 'ripe', 79: 'ripe', 80: 'ripe', 81: 'ripe', 82: 'ripe',
  83: 'ripe', 84: 'ripe', 85: 'ripe', 86: 'ripe', 87: 'ripe', 88: 'ripe',
  89: 'ripe', 90: 'ripe', 91: 'ripe', 92: 'ripe', 93: 'ripe', 94: 'ripe',
  95: 'ripe', 109: 'ripe', 141: 'ripe', 145: 'ripe', 151: 'ripe',
  176: 'ripe', 178: 'ripe', 185: 'ripe', 188: 'ripe', 193: 'ripe',
  194: 'ripe', 195: 'ripe', 212: 'ripe', 213: 'ripe', 217: 'ripe',
  // APNIC
  1: 'apnic', 14: 'apnic', 27: 'apnic', 36: 'apnic', 39: 'apnic',
  42: 'apnic', 43: 'apnic', 49: 'apnic', 58: 'apnic', 59: 'apnic',
  60: 'apnic', 61: 'apnic', 101: 'apnic', 103: 'apnic', 106: 'apnic',
  110: 'apnic', 111: 'apnic', 112: 'apnic', 113: 'apnic', 114: 'apnic',
  115: 'apnic', 116: 'apnic', 117: 'apnic', 118: 'apnic', 119: 'apnic',
  120: 'apnic', 121: 'apnic', 122: 'apnic', 123: 'apnic', 124: 'apnic',
  125: 'apnic', 126: 'apnic', 133: 'apnic', 150: 'apnic', 153: 'apnic',
  175: 'apnic', 180: 'apnic', 182: 'apnic', 183: 'apnic', 202: 'apnic',
  203: 'apnic', 210: 'apnic', 211: 'apnic', 218: 'apnic', 219: 'apnic',
  220: 'apnic', 221: 'apnic', 222: 'apnic', 223: 'apnic',
  // LACNIC
  177: 'lacnic', 179: 'lacnic', 181: 'lacnic', 186: 'lacnic',
  187: 'lacnic', 189: 'lacnic', 190: 'lacnic', 191: 'lacnic', 200: 'lacnic',
  201: 'lacnic',
  // AFRINIC
  41: 'afrinic', 102: 'afrinic', 105: 'afrinic', 154: 'afrinic',
  196: 'afrinic', 197: 'afrinic',
};

function categorize(block: number): Allocation {
  const cidr = `${block}.0.0.0/8`;
  if (block === 0) return { block, cidr, cat: 'reserved', label: 'THIS', org: 'This network (RFC 791)' };
  if (block === 10) return { block, cidr, cat: 'private', label: 'PRIV', org: 'Private-use (RFC 1918)' };
  if (block === 100) return { block, cidr, cat: 'cgnat', label: 'CGN', org: 'Shared / CGNAT (RFC 6598)' };
  if (block === 127) return { block, cidr, cat: 'loopback', label: 'LOOP', org: 'Loopback (RFC 1122)' };
  if (block === 169) return { block, cidr, cat: 'reserved', label: 'LL', org: 'Link-local (RFC 3927)' };
  if (block === 172) return { block, cidr, cat: 'private', label: 'PRIV', org: '172.16/12 private (RFC 1918)' };
  if (block === 192) return { block, cidr, cat: 'private', label: 'DOC', org: '192.168/16 + TEST-NET (RFC 1918/5737)' };
  if (block === 198) return { block, cidr, cat: 'reserved', label: 'BENCH', org: 'Benchmark / TEST-NET-2 (RFC 2544/5737)' };
  if (block === 203) return { block, cidr, cat: 'apnic', label: 'APNIC', org: 'APNIC (incl. TEST-NET-3)' };
  if (block >= 224 && block <= 239) return { block, cidr, cat: 'multicast', label: 'MCAST', org: 'Multicast (RFC 5771)' };
  if (block >= 240 && block <= 254) return { block, cidr, cat: 'reserved', label: 'RSVD', org: 'Reserved / Future use (RFC 1112)' };
  if (block === 255) return { block, cidr, cat: 'reserved', label: 'BCAST', org: 'Limited broadcast' };

  const legacy = LEGACY[block];
  if (legacy) return { block, cidr, cat: 'legacy', label: legacy.label, org: legacy.org };

  const rir = RIR[block];
  if (rir) {
    const labels: Record<AllocationCategory, string> = {
      reserved: 'RSVD', private: 'PRIV', loopback: 'LOOP', cgnat: 'CGN',
      multicast: 'MCAST', legacy: 'LEG', arin: 'ARIN', ripe: 'RIPE',
      apnic: 'APNIC', lacnic: 'LACNIC', afrinic: 'AFRINIC',
    };
    return { block, cidr, cat: rir, label: labels[rir], org: labels[rir] };
  }

  // Default: ARIN delegated space
  return { block, cidr, cat: 'arin', label: 'ARIN', org: 'ARIN (North America)' };
}

export const IPV4_ALLOCATIONS: Allocation[] = Array.from({ length: 256 }, (_, i) => categorize(i));

export function allocationFor(block: number): Allocation {
  return IPV4_ALLOCATIONS[block & 0xff];
}

export const CATEGORY_META: Record<AllocationCategory, { label: string; varName: string }> = {
  reserved:  { label: 'Reserved',          varName: '--muted' },
  private:   { label: 'Private (RFC1918)', varName: '--terminal-amber' },
  loopback:  { label: 'Loopback',          varName: '--terminal-cyan' },
  cgnat:     { label: 'Shared / CGNAT',    varName: '--terminal-amber' },
  multicast: { label: 'Multicast',         varName: '--accent' },
  legacy:    { label: 'Legacy / Corporate',varName: '--terminal-green' },
  arin:      { label: 'ARIN (NA)',         varName: '--primary' },
  ripe:      { label: 'RIPE (EU/ME)',      varName: '--terminal-cyan' },
  apnic:     { label: 'APNIC (AP)',        varName: '--accent' },
  lacnic:    { label: 'LACNIC (LATAM)',    varName: '--terminal-amber' },
  afrinic:   { label: 'AFRINIC (AF)',      varName: '--terminal-green' },
};
