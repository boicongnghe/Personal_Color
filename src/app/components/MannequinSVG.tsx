import { calcMannequinGeometry, SKIN_COLORS } from '../utils/mannequinGeometry';
import type { BodyGender } from '../utils/mannequinGeometry';

interface MannequinSVGProps {
  gender: BodyGender;
  bodyType: string;
  season?: string;
  size?: number;
}

export default function MannequinSVG({ gender, bodyType, season = 'autumn-warm', size = 200 }: MannequinSVGProps) {
  const g = calcMannequinGeometry(size, gender, bodyType);
  const { W, H, cx, headR, headY, neckH, neckW, shoulderY, sw, ww, hw, torsoH, waistY, hipY, footY, torsoPath, armPath, armPathR, leftLegPath, rightLegPath } = g;

  const skinColor = SKIN_COLORS[season] ?? '#C4894A';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block', margin: '0 auto' }}>
      {/* Shadow */}
      <ellipse cx={cx} cy={footY + 6} rx={hw * 0.5} ry={6} fill="rgba(0,0,0,0.08)" />

      {/* Legs */}
      <path d={leftLegPath}  fill={skinColor} />
      <path d={rightLegPath} fill={skinColor} />

      {/* Leg divider */}
      <line x1={cx} y1={hipY + 4} x2={cx} y2={footY - 10} stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />

      {/* Arms */}
      <path d={armPath}  fill={skinColor} />
      <path d={armPathR} fill={skinColor} />

      {/* Torso */}
      <path d={torsoPath} fill={skinColor} />

      {/* Neck */}
      <rect x={cx - neckW/2} y={headY + headR - 4} width={neckW} height={neckH + 4} rx={neckW/3} fill={skinColor} />

      {/* Head */}
      <ellipse cx={cx} cy={headY} rx={headR} ry={headR * 1.15} fill={skinColor} />

      {/* Eyes */}
      <ellipse cx={cx - headR*0.3} cy={headY - headR*0.05} rx={headR*0.08} ry={headR*0.1} fill="#4A3020" />
      <ellipse cx={cx + headR*0.3} cy={headY - headR*0.05} rx={headR*0.08} ry={headR*0.1} fill="#4A3020" />
      <circle  cx={cx - headR*0.27} cy={headY - headR*0.08} r={headR*0.025} fill="white" />
      <circle  cx={cx + headR*0.33} cy={headY - headR*0.08} r={headR*0.025} fill="white" />

      {/* Nose */}
      <ellipse cx={cx} cy={headY + headR*0.15} rx={headR*0.06} ry={headR*0.04} fill="rgba(0,0,0,0.12)" />

      {/* Mouth */}
      <path
        d={`M ${cx - headR*0.2} ${headY + headR*0.35} Q ${cx} ${headY + headR*0.48} ${cx + headR*0.2} ${headY + headR*0.35}`}
        stroke="#8B5040" strokeWidth="1.5" fill="none" strokeLinecap="round"
      />

      {/* Hair */}
      {gender === 'female' ? (
        <>
          <ellipse cx={cx} cy={headY - headR*0.6} rx={headR*1.05} ry={headR*0.55} fill="#3D2314" />
          <path
            d={`M ${cx - headR} ${headY - headR*0.2} Q ${cx - headR*1.3} ${headY + headR*0.8} ${cx - headR*1.1} ${headY + headR*1.4}`}
            stroke="#3D2314" strokeWidth={headR*0.5} fill="none" strokeLinecap="round"
          />
          <path
            d={`M ${cx + headR} ${headY - headR*0.2} Q ${cx + headR*1.3} ${headY + headR*0.8} ${cx + headR*1.1} ${headY + headR*1.4}`}
            stroke="#3D2314" strokeWidth={headR*0.5} fill="none" strokeLinecap="round"
          />
        </>
      ) : (
        <ellipse cx={cx} cy={headY - headR*0.65} rx={headR*1.02} ry={headR*0.45} fill="#3D2314" />
      )}

      {/* Waist line subtle */}
      <line x1={cx - ww/2 - 2} y1={waistY} x2={cx + ww/2 + 2} y2={waistY} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />

      {/* Shoulder line */}
      <line x1={cx - sw/2} y1={shoulderY} x2={cx + sw/2} y2={shoulderY} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
    </svg>
  );
}
