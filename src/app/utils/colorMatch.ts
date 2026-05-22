// Minimal palette map for color match — mirrors shared/seasonalPalettes.js
const PALETTES: Record<string, { palette: string[]; avoid: string[] }> = {
  'autumn-warm':  { palette: ['#C8861A','#8B5A2B','#6B7C2E','#C4602A','#F5E6C8','#B5651D'], avoid: ['#B0C4DE','#C0C0C0','#E8F4FF'] },
  'autumn-deep':  { palette: ['#8B0000','#2F4F2F','#4A2C2A','#1F3A3A','#483D8B','#1C1008'], avoid: ['#E0E8FF','#FFB6C1','#F0FFFE'] },
  'autumn-rich':  { palette: ['#B5451B','#CC8800','#1A5C5C','#A0360A','#C49A3C','#B87333'], avoid: ['#E8F0FF','#FFC0CB','#F0E8FF'] },
  'autumn-muted': { palette: ['#C4A0A0','#8A9E70','#C08060','#BEA898','#6A9898','#8A8A5E'], avoid: ['#FF0080','#00FFFF','#F0F0FF'] },
  'winter-cool':  { palette: ['#FFFFFF','#000000','#1A237E','#C41E3A','#00695C','#283593'], avoid: ['#D2691E','#FFA500','#9ACD32'] },
  'winter-dark':  { palette: ['#4A0080','#0D1B4B','#2C2C2C','#1B4320','#000000','#6B0020'], avoid: ['#FFD700','#FFA07A','#FFA500'] },
  'winter-bright':{ palette: ['#FF1493','#0047AB','#8A00FF','#FF69B4','#0077FF','#00A86B'], avoid: ['#C4A882','#DEB887','#F5DEB3'] },
  'winter-clear': { palette: ['#FFFFFF','#000000','#FF6B6B','#87CEEB','#00FF7F','#FFF44F'], avoid: ['#D2B48C','#BC8F5F','#A0826D'] },
  'spring-warm':  { palette: ['#FFDAB9','#FF7F50','#FFD700','#90EE90','#40E0D0','#FFFFF0'], avoid: ['#2F4F4F','#000033','#36454F'] },
  'spring-light': { palette: ['#FECBA1','#FAFAD2','#98FB98','#FFB6C1','#F5DEB3','#B0E0E6'], avoid: ['#1A1A2E','#16213E','#0F3460'] },
  'spring-bright':{ palette: ['#FF6347','#FFD700','#32CD32','#00CED1','#FF69B4','#FF4500'], avoid: ['#808080','#696969','#A9A9A9'] },
  'spring-clear': { palette: ['#FDFFF5','#00FFFF','#FFB6C1','#FFFF00','#E6AEFF','#BFFF00'], avoid: ['#556B2F','#8B4513','#2F4F4F'] },
  'summer-cool':  { palette: ['#E6CDFF','#DDA0DD','#ADD8E6','#008B8B','#9370DB','#FFC0CB'], avoid: ['#FF8C00','#FFD700','#A0522D'] },
  'summer-light': { palette: ['#ADD8E6','#FFB6C1','#E6CDFF','#98FF98','#FAFAFA','#F0F8FF'], avoid: ['#000080','#8B0000','#006400'] },
  'summer-soft':  { palette: ['#C9A8C4','#A8B87E','#78A89E','#C8A8B8','#87ABCA','#ABABAB'], avoid: ['#FF4500','#FF8C00','#FFD700'] },
  'summer-muted': { palette: ['#A8A8A8','#C4A0A8','#A0A878','#788888','#B8A0A8','#A8A8C8'], avoid: ['#FF0000','#FF6600','#FFCC00'] },
};

function hexToLAB(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const rl = lin(r), gl = lin(g), bl = lin(b);
  const X = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
  const Y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750;
  const Z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041;
  const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const fx = f(X / 0.95047), fy = f(Y), fz = f(Z / 1.08883);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function deltaE(lab1: [number, number, number], lab2: [number, number, number]): number {
  return Math.sqrt(
    Math.pow(lab1[0] - lab2[0], 2) +
    Math.pow(lab1[1] - lab2[1], 2) +
    Math.pow(lab1[2] - lab2[2], 2)
  );
}

export type ColorMatchResult = 'match' | 'avoid' | 'neutral';

export function getColorMatch(itemHex: string, season: string): ColorMatchResult {
  if (!itemHex || !itemHex.startsWith('#') || itemHex.length < 7) return 'neutral';
  const palette = PALETTES[season];
  if (!palette) return 'neutral';

  const itemLAB = hexToLAB(itemHex);

  const bestMatch = palette.palette
    .map(hex => deltaE(itemLAB, hexToLAB(hex)))
    .reduce((min, d) => Math.min(min, d), Infinity);

  const worstMatch = palette.avoid
    .map(hex => deltaE(itemLAB, hexToLAB(hex)))
    .reduce((min, d) => Math.min(min, d), Infinity);

  if (bestMatch < 20)  return 'match';
  if (worstMatch < 15) return 'avoid';
  return 'neutral';
}
