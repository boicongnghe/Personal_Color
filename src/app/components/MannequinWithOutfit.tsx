import MannequinSVG from './MannequinSVG';
import { calcMannequinGeometry, SKIN_COLORS } from '../utils/mannequinGeometry';
import type { BodyGender } from '../utils/mannequinGeometry';

interface OutfitColors {
  top?: string | null;
  bottom?: string | null;
  shoes?: string | null;
}

export interface WardrobeItemForTryOn {
  id: number | string;
  name: string;
  category: string; // 'Áo', 'Quần', 'Váy', 'Áo khoác', 'Giày dép', 'Phụ kiện'
  color?: string;   // hex
}

interface MannequinWithOutfitProps {
  gender: BodyGender;
  bodyType: string;
  season?: string;
  outfitColors?: OutfitColors;
  wardrobeItem?: WardrobeItemForTryOn | null;
  faceShape?: string;
  size?: number;
}

// Season palette first colours for default outfit
const SEASON_TOP_COLORS: Record<string, string> = {
  'autumn-warm':  '#C8861A', 'autumn-deep':  '#2F4F2F', 'autumn-rich':  '#B5451B', 'autumn-muted': '#C4A0A0',
  'winter-cool':  '#1A237E', 'winter-dark':  '#4A0080', 'winter-bright':'#0047AB', 'winter-clear': '#87CEEB',
  'spring-warm':  '#FF7F50', 'spring-light': '#FECBA1', 'spring-bright':'#FF6347', 'spring-clear': '#00FFFF',
  'summer-cool':  '#DDA0DD', 'summer-light': '#ADD8E6', 'summer-soft':  '#C9A8C4', 'summer-muted': '#A8A8A8',
};
const SEASON_BOTTOM_COLORS: Record<string, string> = {
  'autumn-warm':  '#6B7C2E', 'autumn-deep':  '#4A2C2A', 'autumn-rich':  '#1A5C5C', 'autumn-muted': '#8A9E70',
  'winter-cool':  '#000000', 'winter-dark':  '#0D1B4B', 'winter-bright':'#000000', 'winter-clear': '#000000',
  'spring-warm':  '#90EE90', 'spring-light': '#98FB98', 'spring-bright':'#32CD32', 'spring-clear': '#FFB6C1',
  'summer-cool':  '#9370DB', 'summer-light': '#FFB6C1', 'summer-soft':  '#A8B87E', 'summer-muted': '#788888',
};

// Collar shape paths by face shape
function getCollarPath(faceShape: string, cx: number, shoulderY: number, neckW: number): string | null {
  const d = neckW * 2.5;
  switch (faceShape) {
    case 'oval':
    case 'round':
      // V-neck
      return `M ${cx - d} ${shoulderY + 2} L ${cx} ${shoulderY + d * 1.4} L ${cx + d} ${shoulderY + 2}`;
    case 'heart':
      // Sweetheart
      return `M ${cx - d} ${shoulderY + 2} Q ${cx - d*0.3} ${shoulderY + d*1.6} ${cx} ${shoulderY + d*1.2} Q ${cx + d*0.3} ${shoulderY + d*1.6} ${cx + d} ${shoulderY + 2}`;
    case 'diamond':
      // Boat neck — wide straight
      return `M ${cx - d*1.3} ${shoulderY + 4} L ${cx + d*1.3} ${shoulderY + 4}`;
    case 'oblong':
      // Crew neck
      return `M ${cx - d*0.8} ${shoulderY + 2} Q ${cx} ${shoulderY + d*0.6} ${cx + d*0.8} ${shoulderY + 2}`;
    case 'square':
    default:
      // Round collar
      return `M ${cx - d} ${shoulderY + 2} Q ${cx} ${shoulderY + d * 1.2} ${cx + d} ${shoulderY + 2}`;
  }
}

const CATEGORY_LAYER: Record<string, 'top' | 'bottom' | 'shoes'> = {
  'Áo': 'top', 'Áo khoác': 'top',
  'Quần': 'bottom', 'Váy': 'bottom',
  'Giày dép': 'shoes',
};

export default function MannequinWithOutfit({
  gender, bodyType, season = 'autumn-warm',
  outfitColors = {}, wardrobeItem = null, faceShape = 'oval', size = 200,
}: MannequinWithOutfitProps) {
  const g = calcMannequinGeometry(size, gender, bodyType);
  const { W, H, cx, headR, headY, neckH, neckW, shoulderY, sw, ww, hw, torsoH, waistY, hipY, footY, torsoPath, armPath, armPathR, leftLegPath, rightLegPath, legW, legGap } = g;
  const skinColor = SKIN_COLORS[season] ?? '#C4894A';

  const defaultTop    = SEASON_TOP_COLORS[season]    ?? '#C8861A';
  const defaultBottom = SEASON_BOTTOM_COLORS[season] ?? '#6B7C2E';
  const defaultShoe   = '#3D2B1A';

  const itemLayer = wardrobeItem ? CATEGORY_LAYER[wardrobeItem.category] : null;
  const itemColor = wardrobeItem?.color;

  const topColor    = (itemLayer === 'top'    && itemColor) ? itemColor : (outfitColors.top    ?? defaultTop);
  const bottomColor = (itemLayer === 'bottom' && itemColor) ? itemColor : (outfitColors.bottom ?? defaultBottom);
  const shoeColor   = (itemLayer === 'shoes'  && itemColor) ? itemColor : (outfitColors.shoes  ?? defaultShoe);

  // Top clothing — slightly wider than body torso
  const pad = 3;
  const topPath = `
    M ${cx - sw/2 - pad} ${shoulderY}
    C ${cx - sw/2 - pad} ${waistY - torsoH*0.1},
      ${cx - ww/2 - pad} ${waistY - torsoH*0.1},
      ${cx - ww/2 - pad} ${waistY}
    L ${cx + ww/2 + pad} ${waistY}
    C ${cx + ww/2 + pad} ${waistY - torsoH*0.1},
      ${cx + sw/2 + pad} ${waistY - torsoH*0.1},
      ${cx + sw/2 + pad} ${shoulderY}
    Z
  `;

  // Bottom clothing — hips down to leg bottom
  const bottomPath = `
    M ${cx - ww/2 - pad} ${waistY}
    C ${cx - ww/2 - pad} ${waistY + torsoH*0.1},
      ${cx - hw/2 - pad} ${hipY - torsoH*0.05},
      ${cx - hw/2 - pad} ${hipY}
    L ${cx - legGap - legW - pad} ${hipY}
    L ${cx - legGap*0.5 - pad} ${footY}
    L ${cx + legGap*0.5 + pad} ${footY}
    L ${cx + legGap + legW + pad} ${hipY}
    L ${cx + hw/2 + pad} ${hipY}
    C ${cx + hw/2 + pad} ${hipY - torsoH*0.05},
      ${cx + ww/2 + pad} ${waistY + torsoH*0.1},
      ${cx + ww/2 + pad} ${waistY}
    Z
  `;

  // Shoe soles
  const shoeH = H * 0.03;
  const shoeW = legW * 0.9;

  const collarPath = getCollarPath(faceShape, cx, shoulderY, neckW);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block', margin: '0 auto' }}>
      {/* Shadow */}
      <ellipse cx={cx} cy={footY + 6} rx={hw * 0.5} ry={6} fill="rgba(0,0,0,0.08)" />

      {/* Skin layers */}
      <path d={leftLegPath}  fill={skinColor} />
      <path d={rightLegPath} fill={skinColor} />
      <line x1={cx} y1={hipY + 4} x2={cx} y2={footY - 10} stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
      <path d={armPath}  fill={skinColor} />
      <path d={armPathR} fill={skinColor} />
      <path d={torsoPath} fill={skinColor} />
      <rect x={cx - neckW/2} y={headY + headR - 4} width={neckW} height={neckH + 4} rx={neckW/3} fill={skinColor} />
      <ellipse cx={cx} cy={headY} rx={headR} ry={headR * 1.15} fill={skinColor} />

      {/* Clothing — bottom first so top overlaps at waist */}
      <path d={bottomPath} fill={bottomColor} opacity="0.92" />
      {/* Fabric texture */}
      <path d={bottomPath} fill="url(#fabricPattern)" opacity="0.06" />

      <path d={topPath} fill={topColor} opacity="0.92" />
      <path d={topPath} fill="url(#fabricPattern)" opacity="0.06" />

      {/* Arm sleeves (short) */}
      <path
        d={`M ${cx - sw/2 - pad} ${shoulderY} L ${cx - sw/2 - pad - W*0.06} ${shoulderY + torsoH*0.25} L ${cx - sw/2 - W*0.06} ${shoulderY + torsoH*0.25} L ${cx - sw/2} ${shoulderY} Z`}
        fill={topColor} opacity="0.88"
      />
      <path
        d={`M ${cx + sw/2 + pad} ${shoulderY} L ${cx + sw/2 + pad + W*0.06} ${shoulderY + torsoH*0.25} L ${cx + sw/2 + W*0.06} ${shoulderY + torsoH*0.25} L ${cx + sw/2} ${shoulderY} Z`}
        fill={topColor} opacity="0.88"
      />

      {/* Shoes */}
      <rect x={cx - legGap - legW - pad} y={footY - shoeH} width={shoeW} height={shoeH + 4} rx={3} fill={shoeColor} />
      <rect x={cx + legGap + pad}        y={footY - shoeH} width={shoeW} height={shoeH + 4} rx={3} fill={shoeColor} />

      {/* Collar detail */}
      {collarPath && (
        <path d={collarPath} stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}

      {/* Face */}
      <ellipse cx={cx - headR*0.3} cy={headY - headR*0.05} rx={headR*0.08} ry={headR*0.1} fill="#4A3020" />
      <ellipse cx={cx + headR*0.3} cy={headY - headR*0.05} rx={headR*0.08} ry={headR*0.1} fill="#4A3020" />
      <circle  cx={cx - headR*0.27} cy={headY - headR*0.08} r={headR*0.025} fill="white" />
      <circle  cx={cx + headR*0.33} cy={headY - headR*0.08} r={headR*0.025} fill="white" />
      <ellipse cx={cx} cy={headY + headR*0.15} rx={headR*0.06} ry={headR*0.04} fill="rgba(0,0,0,0.12)" />
      <path d={`M ${cx - headR*0.2} ${headY + headR*0.35} Q ${cx} ${headY + headR*0.48} ${cx + headR*0.2} ${headY + headR*0.35}`} stroke="#8B5040" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Hair */}
      {gender === 'female' ? (
        <>
          <ellipse cx={cx} cy={headY - headR*0.6} rx={headR*1.05} ry={headR*0.55} fill="#3D2314" />
          <path d={`M ${cx - headR} ${headY - headR*0.2} Q ${cx - headR*1.3} ${headY + headR*0.8} ${cx - headR*1.1} ${headY + headR*1.4}`} stroke="#3D2314" strokeWidth={headR*0.5} fill="none" strokeLinecap="round" />
          <path d={`M ${cx + headR} ${headY - headR*0.2} Q ${cx + headR*1.3} ${headY + headR*0.8} ${cx + headR*1.1} ${headY + headR*1.4}`} stroke="#3D2314" strokeWidth={headR*0.5} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <ellipse cx={cx} cy={headY - headR*0.65} rx={headR*1.02} ry={headR*0.45} fill="#3D2314" />
      )}

      {/* Fabric texture pattern */}
      <defs>
        <pattern id="fabricPattern" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#000" strokeWidth="0.8" />
        </pattern>
      </defs>
    </svg>
  );
}
