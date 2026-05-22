export type BodyGender = 'female' | 'male';
export type BodyType =
  | 'hourglass' | 'pear' | 'apple' | 'rectangle' | 'inverted_triangle'
  | 'trapezoid' | 'oval' | 'triangle';

export interface MannequinProportions {
  sw: number;     // shoulder width ratio
  ww: number;     // waist width ratio
  hw: number;     // hip width ratio
  sh: number;     // shoulder height ratio (from top)
  torsoH: number; // torso height ratio
  legH: number;   // leg height ratio
}

const PROPORTIONS: Record<BodyGender, Record<string, MannequinProportions>> = {
  female: {
    hourglass:         { sw: 0.58, ww: 0.38, hw: 0.58, sh: 0.22, torsoH: 0.30, legH: 0.42 },
    pear:              { sw: 0.48, ww: 0.40, hw: 0.62, sh: 0.20, torsoH: 0.30, legH: 0.42 },
    apple:             { sw: 0.55, ww: 0.56, hw: 0.52, sh: 0.22, torsoH: 0.30, legH: 0.40 },
    rectangle:         { sw: 0.52, ww: 0.48, hw: 0.52, sh: 0.20, torsoH: 0.30, legH: 0.42 },
    inverted_triangle: { sw: 0.62, ww: 0.42, hw: 0.48, sh: 0.24, torsoH: 0.30, legH: 0.42 },
  },
  male: {
    trapezoid: { sw: 0.62, ww: 0.50, hw: 0.54, sh: 0.24, torsoH: 0.32, legH: 0.40 },
    rectangle: { sw: 0.56, ww: 0.52, hw: 0.54, sh: 0.22, torsoH: 0.32, legH: 0.40 },
    oval:      { sw: 0.54, ww: 0.60, hw: 0.52, sh: 0.22, torsoH: 0.32, legH: 0.38 },
    triangle:  { sw: 0.48, ww: 0.52, hw: 0.60, sh: 0.20, torsoH: 0.32, legH: 0.40 },
  },
};

export interface MannequinGeometry {
  W: number; H: number; cx: number;
  headR: number; headY: number;
  neckH: number; neckW: number;
  shoulderY: number;
  sw: number; ww: number; hw: number;
  torsoH: number;
  waistY: number; hipY: number; footY: number;
  armW: number;
  legW: number; legGap: number;
  torsoPath: string;
  armPath: string; armPathR: string;
  leftLegPath: string; rightLegPath: string;
}

export function calcMannequinGeometry(
  size: number,
  gender: BodyGender,
  bodyType: string
): MannequinGeometry {
  const p = PROPORTIONS[gender]?.[bodyType] ?? PROPORTIONS['female']['rectangle'];
  const W = size;
  const H = size * 2.2;
  const cx = W / 2;

  const headR   = W * 0.13;
  const headY   = headR + H * 0.02;
  const neckH   = H * 0.05;
  const neckW   = W * 0.08;
  const shoulderY = headY + headR + neckH;

  const sw     = W * p.sw;
  const ww     = W * p.ww;
  const hw     = W * p.hw;
  const torsoH = H * p.torsoH;
  const waistY = shoulderY + torsoH * 0.45;
  const hipY   = shoulderY + torsoH;
  const legH   = H * p.legH;
  const footY  = hipY + legH;

  const torsoPath = `
    M ${cx - sw/2} ${shoulderY}
    C ${cx - sw/2} ${waistY - torsoH*0.1},
      ${cx - ww/2} ${waistY - torsoH*0.1},
      ${cx - ww/2} ${waistY}
    C ${cx - ww/2} ${waistY + torsoH*0.1},
      ${cx - hw/2} ${hipY - torsoH*0.05},
      ${cx - hw/2} ${hipY}
    L ${cx + hw/2} ${hipY}
    C ${cx + hw/2} ${hipY - torsoH*0.05},
      ${cx + ww/2} ${waistY + torsoH*0.1},
      ${cx + ww/2} ${waistY}
    C ${cx + ww/2} ${waistY - torsoH*0.1},
      ${cx + sw/2} ${waistY - torsoH*0.1},
      ${cx + sw/2} ${shoulderY}
    Z
  `;

  const armW = W * 0.08;
  const armPath = `
    M ${cx - sw/2} ${shoulderY}
    L ${cx - sw/2 - armW*0.5} ${shoulderY + torsoH*0.8}
    L ${cx - sw/2 - armW}     ${shoulderY + torsoH*0.8}
    L ${cx - sw/2 - armW*0.6} ${shoulderY}
    Z
  `;
  const armPathR = `
    M ${cx + sw/2} ${shoulderY}
    L ${cx + sw/2 + armW*0.5} ${shoulderY + torsoH*0.8}
    L ${cx + sw/2 + armW}     ${shoulderY + torsoH*0.8}
    L ${cx + sw/2 + armW*0.6} ${shoulderY}
    Z
  `;

  const legW   = hw * 0.42;
  const legGap = W * 0.02;
  const leftLegPath = `
    M ${cx - legGap} ${hipY}
    L ${cx - legW - legGap} ${hipY}
    L ${cx - legW*0.85 - legGap} ${footY}
    L ${cx - legGap*0.5} ${footY}
    Z
  `;
  const rightLegPath = `
    M ${cx + legGap} ${hipY}
    L ${cx + legW + legGap} ${hipY}
    L ${cx + legW*0.85 + legGap} ${footY}
    L ${cx + legGap*0.5} ${footY}
    Z
  `;

  return {
    W, H, cx,
    headR, headY, neckH, neckW, shoulderY,
    sw, ww, hw, torsoH, waistY, hipY, footY,
    armW, legW, legGap,
    torsoPath, armPath, armPathR, leftLegPath, rightLegPath,
  };
}

// Skin tone colours derived from seasonal type
export const SKIN_COLORS: Record<string, string> = {
  'autumn-warm':  '#C4894A', 'autumn-deep':   '#8B5E3C',
  'autumn-rich':  '#B87040', 'autumn-muted':  '#C09070',
  'winter-cool':  '#D4A882', 'winter-dark':   '#8B6858',
  'winter-bright':'#E8C9A0', 'winter-clear':  '#DEB887',
  'spring-warm':  '#E8B88A', 'spring-light':  '#F0C8A0',
  'spring-bright':'#E0A870', 'spring-clear':  '#F5D5B0',
  'summer-cool':  '#D4B090', 'summer-light':  '#E8C8B0',
  'summer-soft':  '#C8A888', 'summer-muted':  '#BFA080',
};
