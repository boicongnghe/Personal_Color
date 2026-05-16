const palettes = require('./seasonalPalettes');

const collarByFaceShape = {
  oval: 'Hầu hết cổ áo đều phù hợp — V-neck, cổ tròn và cổ thuyền đều tôn khuôn mặt oval',
  round: 'V-neck hoặc cổ tim tạo ảo giác khuôn mặt dài hơn, tránh cổ tròn và cổ thuyền ngang',
  square: 'Cổ tròn hoặc cổ thuyền làm mềm đường hàm góc cạnh, tránh cổ vuông và mandarin',
  heart: 'Cổ thuyền hoặc scoop neck cân bằng vai rộng với cằm nhỏ, tránh cổ V sâu và halter',
  oblong: 'Cổ thuyền, cowl hoặc turtleneck tạo chiều rộng, tránh V-neck sâu',
  diamond: 'Cổ thuyền, off-shoulder hoặc halter tôn xương đòn, tránh cổ cao và mandarin',
};

const outfitByBodyType = {
  hourglass: {
    style: 'Ôm eo, wrap dress, thắt lưng để tôn đường cong — fitted nhưng không bó chặt',
    tips: ['wrap dress', 'áo ôm eo', 'thắt lưng rõ ràng'],
  },
  pear: {
    style: 'Chân váy A-line hoặc flared, wide-leg pants, áo sáng màu để cân bằng hông rộng',
    tips: ['chân váy A-line', 'wide-leg pants', 'áo sáng màu phần trên'],
  },
  rectangle: {
    style: 'Layered, peplum, ruffle hoặc high waist để tạo ảo giác đường cong eo',
    tips: ['áo có ruffle', 'peplum top', 'quần cao cạp'],
  },
  'inverted-triangle': {
    style: 'Wide-leg pants, A-line skirt để cân bằng vai rộng, tránh shoulder pad và áo ngang vai',
    tips: ['wide-leg pants', 'chân váy xòe', 'áo màu tối phần trên'],
  },
  apple: {
    style: 'Empire waist, vải mềm rũ, V-neck và màu tối phần dưới để tạo ảo giác thon',
    tips: ['empire waist', 'V-neck', 'dark bottom'],
  },
};

const occasionKeywords = {
  casual: ['công thức daily', 'thoải mái', 'streetwear'],
  office: ['công sở thanh lịch', 'smart casual', 'professional'],
  party: ['dạ hội', 'tiệc tùng', 'dự tiệc'],
};

function getOutfitRules(season, occasion, faceShape, bodyType) {
  const pal = palettes[season];
  if (!pal) {
    return {
      collarSuggestion: 'Chọn cổ áo phù hợp với khuôn mặt',
      colorPalette: [],
      outfitStyle: 'Không tìm thấy seasonal type',
      avoidList: [],
      shopKeywords: [],
    };
  }

  const collar = collarByFaceShape[faceShape] || collarByFaceShape.oval;
  const body = outfitByBodyType[bodyType] || outfitByBodyType.rectangle;
  const seasonKeywords = pal.outfitKeywords[occasion] || pal.outfitKeywords.casual;
  const baseOccasion = occasionKeywords[occasion] || occasionKeywords.casual;

  const outfitStyle = `${body.style}. Kết hợp màu ${pal.label} cho dịp ${occasion === 'casual' ? 'hàng ngày' : occasion === 'office' ? 'công sở' : 'tiệc tùng'}.`;

  const shopKeywords = [
    ...seasonKeywords,
    ...body.tips,
    ...baseOccasion,
    pal.label,
  ];

  return {
    collarSuggestion: collar,
    colorPalette: pal.palette,
    outfitStyle,
    avoidList: pal.avoid,
    shopKeywords,
  };
}

module.exports = { getOutfitRules };
