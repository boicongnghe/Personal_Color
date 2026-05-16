// ─── 12 Seasonal Color Types ─────────────────────────────────────────────────
// Dữ liệu 12 nhóm tông màu da theo lý thuyết Color Analysis (seasonal system)
// Mỗi nhóm có bảng màu phù hợp / cần tránh + gợi ý trang điểm / trang sức thực tế

export interface ColorResult {
  id: string;
  name: string; // tên tiếng Anh
  nameVi: string; // tên tiếng Việt
  season: string;
  undertone: string;
  undertoneVi: string;
  contrast: string;
  contrastVi: string;
  confidence: number;
  cardGradient: string; // tailwind classes
  description: string;
  descriptionVi: string;
  detailedAnalysis: string;
  detailedAnalysisVi: string;
  bestColors: { name: string; nameVi: string; hex: string }[];
  avoidColors: { name: string; nameVi: string; hex: string }[];
  recommendations: {
    color1: string;
    color2: string;
    occasion: string;
    occasionVi: string;
  }[];
  jewelry: string[];
  jewelryVi: string[];
  makeup: string[];
  makeupVi: string[];
  sampleImage: string;
}

export const COLOR_TYPES: ColorResult[] = [
  /* ── 1. Warm Autumn ──────────────────────────────────────── */
  {
    id: "warm-autumn",
    name: "Warm Autumn",
    nameVi: "Mùa Thu Ấm",
    season: "Autumn",
    undertone: "Warm / Golden",
    undertoneVi: "Ấm / Vàng vàng",
    contrast: "Medium-High",
    contrastVi: "Trung bình – Cao",
    confidence: 94,
    cardGradient: "from-orange-400 via-amber-500 to-yellow-500",
    description:
      "Your skin has a rich golden undertone that glows beautifully with earthy, autumnal shades.",
    descriptionVi:
      "Làn da của bạn mang sắc độ vàng ấm áp, tỏa sáng rực rỡ với các gam màu mộc mạc của mùa thu.",
    detailedAnalysis:
      "High contrast between hair and skin allows deep, saturated earthy tones to enhance your natural warmth.",
    detailedAnalysisVi:
      "Độ tương phản cao giữa tóc và da giúp các gam màu đất trầm, bão hòa tôn lên vẻ ấm áp tự nhiên của bạn.",
    bestColors: [
      {
        name: "Warm Coral",
        nameVi: "San hô ấm",
        hex: "#E07050",
      },
      {
        name: "Olive Green",
        nameVi: "Xanh Olive",
        hex: "#7D8A3C",
      },
      {
        name: "Burnt Orange",
        nameVi: "Cam cháy",
        hex: "#C25E2A",
      },
      {
        name: "Golden Yellow",
        nameVi: "Vàng Kim",
        hex: "#D4A017",
      },
      {
        name: "Caramel Brown",
        nameVi: "Nâu Caramel",
        hex: "#9B6B3A",
      },
      { name: "Rust Red", nameVi: "Đỏ rỉ sét", hex: "#B34535" },
    ],
    avoidColors: [
      { name: "Icy Pink", nameVi: "Hồng băng", hex: "#F4C2D0" },
      { name: "Icy Blue", nameVi: "Xanh băng", hex: "#AADDF5" },
      {
        name: "Pure White",
        nameVi: "Trắng tinh",
        hex: "#F8F8F8",
      },
      {
        name: "Cool Violet",
        nameVi: "Tím lạnh",
        hex: "#9B76C8",
      },
    ],
    recommendations: [
      {
        color1: "#E07050",
        color2: "#9B6B3A",
        occasion: "Casual",
        occasionVi: "Thường ngày",
      },
      {
        color1: "#7D8A3C",
        color2: "#D4A017",
        occasion: "Work",
        occasionVi: "Công sở",
      },
      {
        color1: "#C25E2A",
        color2: "#B34535",
        occasion: "Evening",
        occasionVi: "Dự tiệc",
      },
    ],
    jewelry: ["Gold", "Rose Gold", "Bronze"],
    jewelryVi: ["Vàng", "Vàng hồng", "Đồng"],
    makeup: [
      "Peach Blush",
      "Warm Brown Eyeshadow",
      "Brick Red Lip",
    ],
    makeupVi: [
      "Phấn má hồng đào",
      "Phấn mắt nâu ấm",
      "Son đỏ gạch",
    ],
    sampleImage:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
  },

  /* ── 2. Deep Autumn ──────────────────────────────────────── */
  {
    id: "deep-autumn",
    name: "Deep Autumn",
    nameVi: "Mùa Thu Sâu",
    season: "Autumn",
    undertone: "Warm / Dark",
    undertoneVi: "Ấm / Tối",
    contrast: "High",
    contrastVi: "Cao",
    confidence: 91,
    cardGradient: "from-red-900 via-amber-900 to-stone-700",
    description:
      "Your deep, rich coloring thrives with dark, warm, luxurious hues.",
    descriptionVi:
      "Nền da đậm, phong phú của bạn phù hợp nhất với những sắc màu tối, ấm và sang trọng.",
    detailedAnalysis:
      "Strong hair-skin contrast means you can carry very deep colors that would overwhelm lighter types.",
    detailedAnalysisVi:
      "Độ tương phản mạnh giữa tóc và da giúp bạn diện được những gam màu cực đậm mà các tông da khác sẽ bị 'nhấn chìm'.",
    bestColors: [
      {
        name: "Burgundy",
        nameVi: "Rượu vang đỏ",
        hex: "#800020",
      },
      {
        name: "Forest Green",
        nameVi: "Xanh rừng",
        hex: "#2D5A27",
      },
      {
        name: "Deep Chocolate",
        nameVi: "Socola đậm",
        hex: "#5C3A1E",
      },
      {
        name: "Terracotta",
        nameVi: "Đất nung",
        hex: "#C25B35",
      },
      {
        name: "Dark Mustard",
        nameVi: "Vàng mù tạt",
        hex: "#8B6914",
      },
      { name: "Copper", nameVi: "Đồng đỏ", hex: "#A0522D" },
    ],
    avoidColors: [
      {
        name: "Light Pink",
        nameVi: "Hồng nhạt",
        hex: "#FFB6C1",
      },
      {
        name: "Baby Blue",
        nameVi: "Xanh baby",
        hex: "#B0D0E8",
      },
      {
        name: "Mint Green",
        nameVi: "Xanh bạc hà",
        hex: "#98DDCA",
      },
      {
        name: "Lavender",
        nameVi: "Tím lavender",
        hex: "#C9B1D8",
      },
    ],
    recommendations: [
      {
        color1: "#800020",
        color2: "#5C3A1E",
        occasion: "Casual",
        occasionVi: "Thường ngày",
      },
      {
        color1: "#2D5A27",
        color2: "#8B6914",
        occasion: "Work",
        occasionVi: "Công sở",
      },
      {
        color1: "#C25B35",
        color2: "#800020",
        occasion: "Evening",
        occasionVi: "Dự tiệc",
      },
    ],
    jewelry: ["Gold", "Copper", "Amber"],
    jewelryVi: ["Vàng", "Đồng đỏ", "Hổ phách"],
    makeup: [
      "Deep Mocha Lip",
      "Bronze Eyeshadow",
      "Warm Terracotta Blush",
    ],
    makeupVi: [
      "Son Mocha đậm",
      "Phấn mắt đồng",
      "Phấn má terracotta ấm",
    ],
    sampleImage:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400",
  },

  /* ── 3. Soft Autumn ──────────────────────────────────────── */
  {
    id: "soft-autumn",
    name: "Soft Autumn",
    nameVi: "Mùa Thu Nhẹ",
    season: "Autumn",
    undertone: "Warm-Neutral / Muted",
    undertoneVi: "Ấm trung hòa / Dịu nhẹ",
    contrast: "Low",
    contrastVi: "Thấp",
    confidence: 88,
    cardGradient: "from-stone-400 via-amber-400 to-yellow-300",
    description:
      "Your muted, warm coloring is beautifully complemented by soft, dusty, earth-toned palettes.",
    descriptionVi:
      "Làn da trung hòa ấm của bạn được tôn lên đẹp nhất bởi các bảng màu mềm mại, dusty và đất tông.",
    detailedAnalysis:
      "Low overall contrast means your colors should blend harmoniously rather than create sharp contrasts.",
    detailedAnalysisVi:
      "Độ tương phản thấp tổng thể nghĩa là màu sắc của bạn cần hòa quyện nhẹ nhàng thay vì tạo sự tương phản mạnh.",
    bestColors: [
      {
        name: "Dusty Rose",
        nameVi: "Hồng dusty",
        hex: "#B87C7C",
      },
      {
        name: "Sage Green",
        nameVi: "Xanh xô thơm",
        hex: "#7C9B76",
      },
      { name: "Camel", nameVi: "Nâu lạc đà", hex: "#C19A6B" },
      {
        name: "Muted Orange",
        nameVi: "Cam nhạt",
        hex: "#C4784D",
      },
      {
        name: "Soft Teal",
        nameVi: "Lam xanh nhẹ",
        hex: "#5B8A8A",
      },
      {
        name: "Warm Taupe",
        nameVi: "Nâu xám ấm",
        hex: "#8C7C6C",
      },
    ],
    avoidColors: [
      {
        name: "Neon Yellow",
        nameVi: "Vàng neon",
        hex: "#FFF44F",
      },
      { name: "Hot Pink", nameVi: "Hồng rực", hex: "#FF69B4" },
      {
        name: "Pure Black",
        nameVi: "Đen thuần",
        hex: "#111111",
      },
      {
        name: "Bright White",
        nameVi: "Trắng sáng",
        hex: "#FFFFFF",
      },
    ],
    recommendations: [
      {
        color1: "#B87C7C",
        color2: "#C19A6B",
        occasion: "Casual",
        occasionVi: "Thường ngày",
      },
      {
        color1: "#7C9B76",
        color2: "#8C7C6C",
        occasion: "Work",
        occasionVi: "Công sở",
      },
      {
        color1: "#C4784D",
        color2: "#5B8A8A",
        occasion: "Evening",
        occasionVi: "Dự tiệc",
      },
    ],
    jewelry: ["Rose Gold", "Wood Beads", "Matte Gold"],
    jewelryVi: ["Vàng hồng", "Chuỗi gỗ", "Vàng mờ"],
    makeup: [
      "Dusty Pink Lip",
      "Warm Taupe Shadow",
      "Soft Peach Blush",
    ],
    makeupVi: [
      "Son hồng dusty",
      "Phấn mắt taupe ấm",
      "Phấn má đào nhạt",
    ],
    sampleImage:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400",
  },

  /* ── 4. True Autumn ──────────────────────────────────────── */
  {
    id: "true-autumn",
    name: "True Autumn",
    nameVi: "Mùa Thu Thực",
    season: "Autumn",
    undertone: "Warm / Spicy",
    undertoneVi: "Ấm / Cay nồng",
    contrast: "Medium",
    contrastVi: "Trung bình",
    confidence: 90,
    cardGradient: "from-amber-600 via-orange-500 to-red-600",
    description:
      "Your skin glows with warm spice tones — think pumpkin, cinnamon, and harvest wheat.",
    descriptionVi:
      "Làn da của bạn tỏa sáng với những tông màu ấm cay — như bí đỏ, quế và lúa mì thu hoạch.",
    detailedAnalysis:
      "Medium contrast allows you to mix rich warm shades beautifully without looking overwhelming.",
    detailedAnalysisVi:
      "Độ tương phản trung bình giúp bạn phối các gam màu ấm đậm một cách đẹp đẽ mà không bị quá tải.",
    bestColors: [
      { name: "Pumpkin", nameVi: "Màu bí đỏ", hex: "#D2622A" },
      { name: "Cinnamon", nameVi: "Màu quế", hex: "#B5651D" },
      {
        name: "Dark Olive",
        nameVi: "Olive tối",
        hex: "#556B2F",
      },
      { name: "Warm Brown", nameVi: "Nâu ấm", hex: "#8B4513" },
      {
        name: "Harvest Gold",
        nameVi: "Vàng thu",
        hex: "#D4AC16",
      },
      { name: "Sienna", nameVi: "Màu đất đỏ", hex: "#A0522D" },
    ],
    avoidColors: [
      {
        name: "Pastel Blue",
        nameVi: "Xanh pastel",
        hex: "#AEC6CF",
      },
      {
        name: "Fuchsia",
        nameVi: "Hồng fuchsia",
        hex: "#FF77FF",
      },
      { name: "Silver", nameVi: "Bạc", hex: "#C0C0C0" },
      { name: "Cool Gray", nameVi: "Xám lạnh", hex: "#7F8B9A" },
    ],
    recommendations: [
      {
        color1: "#D2622A",
        color2: "#D4AC16",
        occasion: "Casual",
        occasionVi: "Thường ngày",
      },
      {
        color1: "#556B2F",
        color2: "#B5651D",
        occasion: "Work",
        occasionVi: "Công sở",
      },
      {
        color1: "#8B4513",
        color2: "#A0522D",
        occasion: "Evening",
        occasionVi: "Dự tiệc",
      },
    ],
    jewelry: ["Gold", "Amber", "Tiger Eye"],
    jewelryVi: ["Vàng", "Hổ phách", "Mắt hổ"],
    makeup: [
      "Cinnamon Lip",
      "Deep Bronze Shadow",
      "Apricot Blush",
    ],
    makeupVi: [
      "Son màu quế",
      "Phấn mắt đồng sâu",
      "Phấn má mơ",
    ],
    sampleImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
  },

  /* ── 5. Cool Summer ──────────────────────────────────────── */
  {
    id: "cool-summer",
    name: "Cool Summer",
    nameVi: "Mùa Hè Mát",
    season: "Summer",
    undertone: "Cool / Pink",
    undertoneVi: "Lạnh / Hồng",
    contrast: "Low-Medium",
    contrastVi: "Thấp – Trung bình",
    confidence: 92,
    cardGradient: "from-sky-400 via-blue-400 to-indigo-400",
    description:
      "Your cool, rosy skin tone looks most beautiful in dusty, muted, and powdery cool shades.",
    descriptionVi:
      "Làn da hồng mát của bạn trông đẹp nhất trong các gam màu dusty, dịu nhẹ và phấn lạnh.",
    detailedAnalysis:
      "Soft, blended makeup and muted clothing colors harmonize with your cool, understated elegance.",
    detailedAnalysisVi:
      "Trang điểm mềm mại và trang phục màu dịu nhẹ hòa hợp với vẻ thanh lịch mát dịu của bạn.",
    bestColors: [
      {
        name: "Dusty Rose",
        nameVi: "Hồng bụi",
        hex: "#C49A9A",
      },
      {
        name: "Powder Blue",
        nameVi: "Xanh phấn",
        hex: "#87CEEB",
      },
      {
        name: "Lavender",
        nameVi: "Tím lavender",
        hex: "#B57EDC",
      },
      {
        name: "Muted Navy",
        nameVi: "Navy dịu",
        hex: "#3A5068",
      },
      {
        name: "Soft Mauve",
        nameVi: "Hoa cà nhạt",
        hex: "#9E7C8C",
      },
      { name: "Icy Gray", nameVi: "Xám băng", hex: "#9BA8B4" },
    ],
    avoidColors: [
      { name: "Warm Orange", nameVi: "Cam ấm", hex: "#E87040" },
      {
        name: "Golden Yellow",
        nameVi: "Vàng kim",
        hex: "#D4A017",
      },
      { name: "Rust", nameVi: "Màu rỉ sét", hex: "#B7410E" },
      {
        name: "Olive Green",
        nameVi: "Xanh olive",
        hex: "#808000",
      },
    ],
    recommendations: [
      {
        color1: "#C49A9A",
        color2: "#9BA8B4",
        occasion: "Casual",
        occasionVi: "Thường ngày",
      },
      {
        color1: "#3A5068",
        color2: "#9E7C8C",
        occasion: "Work",
        occasionVi: "Công sở",
      },
      {
        color1: "#B57EDC",
        color2: "#87CEEB",
        occasion: "Evening",
        occasionVi: "Dự tiệc",
      },
    ],
    jewelry: ["Silver", "Pearl", "White Gold"],
    jewelryVi: ["Bạc", "Ngọc trai", "Vàng trắng"],
    makeup: [
      "Rose Petal Lip",
      "Cool Taupe Shadow",
      "Cool Pink Blush",
    ],
    makeupVi: [
      "Son hoa hồng",
      "Phấn mắt taupe lạnh",
      "Phấn má hồng lạnh",
    ],
    sampleImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
  },

  /* ── 6. Light Summer ──────────────────────────────────────── */
  {
    id: "light-summer",
    name: "Light Summer",
    nameVi: "Mùa Hè Sáng",
    season: "Summer",
    undertone: "Cool / Light",
    undertoneVi: "Lạnh / Sáng nhẹ",
    contrast: "Low",
    contrastVi: "Thấp",
    confidence: 86,
    cardGradient: "from-blue-200 via-purple-200 to-pink-200",
    description:
      "Your light, delicate features look exquisite in soft pastels and light, cool shades.",
    descriptionVi:
      "Nét thanh tú nhẹ nhàng của bạn rực rỡ nhất trong các gam màu pastel nhẹ và màu lạnh sáng.",
    detailedAnalysis:
      "Keep your palette light and harmonious — dark or bold colors will overpower your gentle features.",
    detailedAnalysisVi:
      "Duy trì bảng màu sáng nhẹ và hài hòa — màu tối hoặc đậm sẽ áp đảo nét thanh tú của bạn.",
    bestColors: [
      {
        name: "Rose Water",
        nameVi: "Hồng nước hoa",
        hex: "#F5C5C5",
      },
      {
        name: "Pale Blue",
        nameVi: "Xanh nhạt",
        hex: "#C0D8EC",
      },
      {
        name: "Soft Lilac",
        nameVi: "Tím cà nhạt",
        hex: "#C5B8D8",
      },
      {
        name: "Light Sage",
        nameVi: "Xanh xô nhạt",
        hex: "#B8C9B2",
      },
      {
        name: "Shell Pink",
        nameVi: "Hồng vỏ sò",
        hex: "#F2D0C6",
      },
      {
        name: "Powder Gray",
        nameVi: "Xám phấn",
        hex: "#C8D2DA",
      },
    ],
    avoidColors: [
      { name: "Black", nameVi: "Đen", hex: "#111111" },
      { name: "Bright Red", nameVi: "Đỏ rực", hex: "#DD2222" },
      {
        name: "Neon Colors",
        nameVi: "Màu neon",
        hex: "#AAFF00",
      },
      { name: "Deep Brown", nameVi: "Nâu đậm", hex: "#5C3A1E" },
    ],
    recommendations: [
      {
        color1: "#F5C5C5",
        color2: "#C8D2DA",
        occasion: "Casual",
        occasionVi: "Thường ngày",
      },
      {
        color1: "#C0D8EC",
        color2: "#C5B8D8",
        occasion: "Work",
        occasionVi: "Công sở",
      },
      {
        color1: "#F2D0C6",
        color2: "#C5B8D8",
        occasion: "Evening",
        occasionVi: "Dự tiệc",
      },
    ],
    jewelry: ["Silver", "Pearl", "Rose Quartz"],
    jewelryVi: ["Bạc", "Ngọc trai", "Thạch anh hồng"],
    makeup: [
      "Sheer Pink Lip",
      "Soft Lavender Shadow",
      "Light Coral Blush",
    ],
    makeupVi: [
      "Son hồng trong suốt",
      "Phấn mắt tím nhạt",
      "Phấn má san hô nhạt",
    ],
    sampleImage:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400",
  },

  /* ── 7. Soft Summer ──────────────────────────────────────── */
  {
    id: "soft-summer",
    name: "Soft Summer",
    nameVi: "Mùa Hè Nhẹ",
    season: "Summer",
    undertone: "Cool-Neutral / Muted",
    undertoneVi: "Lạnh trung hòa / Dịu nhẹ",
    contrast: "Low",
    contrastVi: "Thấp",
    confidence: 87,
    cardGradient: "from-purple-300 via-pink-300 to-blue-300",
    description:
      "Your soft, muted coloring is flattered by blended, dusty hues rather than bold contrasts.",
    descriptionVi:
      "Làn da dịu nhẹ của bạn phù hợp nhất với các màu mờ, dusty hơn là những tương phản mạnh.",
    detailedAnalysis:
      "Avoid stark contrasts — instead opt for tonal dressing and color-blending looks.",
    detailedAnalysisVi:
      "Tránh tương phản mạnh — thay vào đó chọn những bộ đồ cùng tông và phối màu chuyển tiếp nhẹ.",
    bestColors: [
      {
        name: "Dusty Blue",
        nameVi: "Xanh bụi",
        hex: "#7BA7C0",
      },
      {
        name: "Blush Pink",
        nameVi: "Hồng blush",
        hex: "#DEAAAA",
      },
      {
        name: "Soft Plum",
        nameVi: "Tím mận nhạt",
        hex: "#A0789A",
      },
      { name: "Stone Gray", nameVi: "Xám đá", hex: "#8C8C9E" },
      {
        name: "Muted Teal",
        nameVi: "Lam xanh nhạt",
        hex: "#6A9B9B",
      },
      { name: "Warm Ivory", nameVi: "Ngà ấm", hex: "#F5EDD5" },
    ],
    avoidColors: [
      {
        name: "Hot Orange",
        nameVi: "Cam nóng",
        hex: "#FF6600",
      },
      {
        name: "Neon Green",
        nameVi: "Xanh neon",
        hex: "#39FF14",
      },
      { name: "Deep Black", nameVi: "Đen đậm", hex: "#080808" },
      {
        name: "Bright Gold",
        nameVi: "Vàng chói",
        hex: "#FFD700",
      },
    ],
    recommendations: [
      {
        color1: "#DEAAAA",
        color2: "#7BA7C0",
        occasion: "Casual",
        occasionVi: "Thường ngày",
      },
      {
        color1: "#8C8C9E",
        color2: "#6A9B9B",
        occasion: "Work",
        occasionVi: "Công sở",
      },
      {
        color1: "#A0789A",
        color2: "#DEAAAA",
        occasion: "Evening",
        occasionVi: "Dự tiệc",
      },
    ],
    jewelry: ["Silver", "Moonstone", "Amethyst"],
    jewelryVi: ["Bạc", "Đá mặt trăng", "Thạch anh tím"],
    makeup: [
      "Mauve Lip",
      "Dusty Rose Shadow",
      "Soft Pink Blush",
    ],
    makeupVi: [
      "Son màu hoa cà",
      "Phấn mắt dusty rose",
      "Phấn má hồng dịu",
    ],
    sampleImage:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400",
  },

  /* ── 8. Warm Spring ──────────────────────────────────────── */
  {
    id: "warm-spring",
    name: "Warm Spring",
    nameVi: "Mùa Xuân Ấm",
    season: "Spring",
    undertone: "Warm / Peach-Golden",
    undertoneVi: "Ấm / Đào vàng",
    contrast: "Medium",
    contrastVi: "Trung bình",
    confidence: 93,
    cardGradient: "from-yellow-400 via-lime-400 to-green-400",
    description:
      "Your warm, peachy skin radiates in fresh spring colors with a sun-kissed quality.",
    descriptionVi:
      "Làn da đào ấm của bạn tỏa sáng rực rỡ trong các màu xuân tươi mát với vẻ rám nắng tự nhiên.",
    detailedAnalysis:
      "Warm, clear, and fresh colors harmonize with your naturally vibrant complexion.",
    detailedAnalysisVi:
      "Những màu sắc ấm, trong trẻo và tươi mát hài hòa hoàn hảo với làn da sáng khỏe của bạn.",
    bestColors: [
      { name: "Warm Peach", nameVi: "Đào ấm", hex: "#FFAB76" },
      { name: "Coral", nameVi: "San hô", hex: "#FF6B6B" },
      {
        name: "Fresh Green",
        nameVi: "Xanh lá tươi",
        hex: "#6DB672",
      },
      {
        name: "Turquoise",
        nameVi: "Xanh lam ngọc",
        hex: "#40BCD8",
      },
      {
        name: "Golden Tan",
        nameVi: "Nâu vàng",
        hex: "#C9A056",
      },
      {
        name: "Warm Yellow",
        nameVi: "Vàng ấm",
        hex: "#F0C040",
      },
    ],
    avoidColors: [
      { name: "Cool Gray", nameVi: "Xám lạnh", hex: "#8FA0B2" },
      { name: "Burgundy", nameVi: "Đỏ rượu", hex: "#800020" },
      { name: "Icy Blue", nameVi: "Xanh băng", hex: "#C8E4F8" },
      {
        name: "Cool Purple",
        nameVi: "Tím lạnh",
        hex: "#8A60B0",
      },
    ],
    recommendations: [
      {
        color1: "#FFAB76",
        color2: "#F0C040",
        occasion: "Casual",
        occasionVi: "Thường ngày",
      },
      {
        color1: "#6DB672",
        color2: "#C9A056",
        occasion: "Work",
        occasionVi: "Công sở",
      },
      {
        color1: "#FF6B6B",
        color2: "#40BCD8",
        occasion: "Evening",
        occasionVi: "Dự tiệc",
      },
    ],
    jewelry: ["Gold", "Rose Gold", "Citrine"],
    jewelryVi: ["Vàng", "Vàng hồng", "Đá vàng chanh"],
    makeup: ["Coral Lip", "Warm Gold Shadow", "Apricot Blush"],
    makeupVi: ["Son san hô", "Phấn mắt vàng ấm", "Phấn má mơ"],
    sampleImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
  },

  /* ── 9. Light Spring ──────────────────────────────────────── */
  {
    id: "light-spring",
    name: "Light Spring",
    nameVi: "Mùa Xuân Sáng",
    season: "Spring",
    undertone: "Warm / Light",
    undertoneVi: "Ấm / Sáng nhẹ",
    contrast: "Low",
    contrastVi: "Thấp",
    confidence: 85,
    cardGradient: "from-yellow-200 via-green-200 to-teal-200",
    description:
      "Your light, delicate warmth glows in soft, fresh pastels and warm light colors.",
    descriptionVi:
      "Sắc ấm nhẹ nhàng của bạn tỏa sáng trong các màu pastel mềm, tươi mát và màu sáng ấm.",
    detailedAnalysis:
      "Avoid overly saturated colors — your beauty is enhanced by light, delicate shades.",
    detailedAnalysisVi:
      "Tránh màu quá bão hòa — vẻ đẹp của bạn được tôn lên bởi những sắc màu nhẹ nhàng, tinh tế.",
    bestColors: [
      {
        name: "Light Peach",
        nameVi: "Đào nhạt",
        hex: "#FFDAB9",
      },
      { name: "Champagne", nameVi: "Sâm panh", hex: "#F7E8C8" },
      {
        name: "Soft Aqua",
        nameVi: "Ngọc lam nhạt",
        hex: "#A8D8E2",
      },
      { name: "Warm Ivory", nameVi: "Ngà ấm", hex: "#FFFFF0" },
      {
        name: "Light Coral",
        nameVi: "San hô nhạt",
        hex: "#F08080",
      },
      {
        name: "Pale Gold",
        nameVi: "Vàng nhạt",
        hex: "#E8D090",
      },
    ],
    avoidColors: [
      { name: "Black", nameVi: "Đen", hex: "#111111" },
      { name: "Dark Navy", nameVi: "Navy đậm", hex: "#1A2A4A" },
      { name: "Hot Pink", nameVi: "Hồng rực", hex: "#FF69B4" },
      {
        name: "Cool Mauve",
        nameVi: "Hoa cà lạnh",
        hex: "#9E7491",
      },
    ],
    recommendations: [
      {
        color1: "#FFDAB9",
        color2: "#E8D090",
        occasion: "Casual",
        occasionVi: "Thường ngày",
      },
      {
        color1: "#A8D8E2",
        color2: "#FFFFF0",
        occasion: "Work",
        occasionVi: "Công sở",
      },
      {
        color1: "#F08080",
        color2: "#FFDAB9",
        occasion: "Evening",
        occasionVi: "Dự tiệc",
      },
    ],
    jewelry: ["Gold", "Pearl", "Rose Quartz"],
    jewelryVi: ["Vàng", "Ngọc trai", "Thạch anh hồng"],
    makeup: [
      "Peachy Pink Lip",
      "Champagne Shadow",
      "Soft Peach Blush",
    ],
    makeupVi: [
      "Son hồng đào",
      "Phấn mắt sâm panh",
      "Phấn má đào nhạt",
    ],
    sampleImage:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
  },

  /* ── 10. True Spring ──────────────────────────────────────── */
  {
    id: "true-spring",
    name: "True Spring",
    nameVi: "Mùa Xuân Thực",
    season: "Spring",
    undertone: "Warm / Clear",
    undertoneVi: "Ấm / Trong trẻo",
    contrast: "Medium-High",
    contrastVi: "Trung bình – Cao",
    confidence: 92,
    cardGradient: "from-lime-400 via-yellow-400 to-orange-300",
    description:
      "Your warm, clear coloring sparkles in bright, fresh, vivid warm shades.",
    descriptionVi:
      "Làn da trong trẻo ấm của bạn lấp lánh trong những màu sắc sáng, tươi mới và rực rỡ.",
    detailedAnalysis:
      "High clarity in your coloring means you can wear clear, bright colors that many other types cannot.",
    detailedAnalysisVi:
      "Độ trong trẻo cao của làn da giúp bạn diện được những màu sắc rõ ràng, tươi sáng mà nhiều tông da khác không thể.",
    bestColors: [
      {
        name: "Bright Coral",
        nameVi: "San hô rực",
        hex: "#FF4E50",
      },
      {
        name: "Warm Turquoise",
        nameVi: "Ngọc lam ấm",
        hex: "#30B5C8",
      },
      {
        name: "Sunny Yellow",
        nameVi: "Vàng nắng",
        hex: "#FFD93D",
      },
      {
        name: "Fresh Green",
        nameVi: "Xanh lá tươi",
        hex: "#5CB85C",
      },
      { name: "Warm Orange", nameVi: "Cam ấm", hex: "#FF8C42" },
      {
        name: "Clear Red",
        nameVi: "Đỏ trong trẻo",
        hex: "#E84040",
      },
    ],
    avoidColors: [
      { name: "Icy Pink", nameVi: "Hồng băng", hex: "#F0C0D0" },
      {
        name: "Cool Mauve",
        nameVi: "Hoa cà lạnh",
        hex: "#9E7491",
      },
      { name: "Dark Brown", nameVi: "Nâu tối", hex: "#4A2F1C" },
      {
        name: "Muted Olive",
        nameVi: "Olive nhạt",
        hex: "#8D8D5C",
      },
    ],
    recommendations: [
      {
        color1: "#FFD93D",
        color2: "#FF8C42",
        occasion: "Casual",
        occasionVi: "Thường ngày",
      },
      {
        color1: "#5CB85C",
        color2: "#30B5C8",
        occasion: "Work",
        occasionVi: "Công sở",
      },
      {
        color1: "#FF4E50",
        color2: "#FFD93D",
        occasion: "Evening",
        occasionVi: "Dự tiệc",
      },
    ],
    jewelry: ["Gold", "Citrine", "Coral Stone"],
    jewelryVi: ["Vàng", "Đá vàng chanh", "Đá san hô"],
    makeup: [
      "Bright Coral Lip",
      "Golden Bronze Shadow",
      "Peach Blush",
    ],
    makeupVi: [
      "Son san hô rực",
      "Phấn mắt đồng vàng",
      "Phấn má đào",
    ],
    sampleImage:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400",
  },

  /* ── 11. Cool Winter ──────────────────────────────────────── */
  {
    id: "cool-winter",
    name: "Cool Winter",
    nameVi: "Mùa Đông Lạnh",
    season: "Winter",
    undertone: "Cool / Pink-Blue",
    undertoneVi: "Lạnh / Hồng xanh",
    contrast: "High",
    contrastVi: "Cao",
    confidence: 95,
    cardGradient: "from-blue-600 via-indigo-600 to-purple-600",
    description:
      "Your cool, high-contrast features are stunning in clear, icy, and bright cool hues.",
    descriptionVi:
      "Nét tương phản cao, lạnh của bạn cực kỳ nổi bật trong các màu lạnh rõ ràng, băng giá và tươi sáng.",
    detailedAnalysis:
      "Strong contrast between light skin and dark hair means bright, clear colors make you look polished and striking.",
    detailedAnalysisVi:
      "Tương phản mạnh giữa da sáng và tóc tối khiến các màu sắc tươi, rõ ràng làm bạn trông thanh lịch và ấn tượng.",
    bestColors: [
      {
        name: "Royal Blue",
        nameVi: "Xanh hoàng gia",
        hex: "#2957A4",
      },
      { name: "True Red", nameVi: "Đỏ thuần", hex: "#CC2222" },
      {
        name: "Fuchsia",
        nameVi: "Hồng fuchsia",
        hex: "#CC0099",
      },
      { name: "Icy Pink", nameVi: "Hồng băng", hex: "#FFAAD4" },
      {
        name: "Emerald",
        nameVi: "Xanh ngọc lục",
        hex: "#009977",
      },
      {
        name: "Pure White",
        nameVi: "Trắng thuần",
        hex: "#F5F5F5",
      },
    ],
    avoidColors: [
      { name: "Warm Orange", nameVi: "Cam ấm", hex: "#E87040" },
      {
        name: "Golden Beige",
        nameVi: "Be vàng",
        hex: "#D4B48C",
      },
      { name: "Camel", nameVi: "Nâu lạc đà", hex: "#C19A6B" },
      { name: "Olive", nameVi: "Xanh olive", hex: "#808000" },
    ],
    recommendations: [
      {
        color1: "#F5F5F5",
        color2: "#2957A4",
        occasion: "Casual",
        occasionVi: "Thường ngày",
      },
      {
        color1: "#2957A4",
        color2: "#CC0099",
        occasion: "Work",
        occasionVi: "Công sở",
      },
      {
        color1: "#CC2222",
        color2: "#009977",
        occasion: "Evening",
        occasionVi: "Dự tiệc",
      },
    ],
    jewelry: ["Silver", "White Gold", "Diamond", "Sapphire"],
    jewelryVi: [
      "Bạc",
      "Vàng trắng",
      "Kim cương",
      "Đá sapphire",
    ],
    makeup: ["Cool Red Lip", "Icy Pink Shadow", "Berry Blush"],
    makeupVi: [
      "Son đỏ lạnh",
      "Phấn mắt hồng băng",
      "Phấn má berry",
    ],
    sampleImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
  },

  /* ── 12. Deep Winter ──────────────────────────────────────── */
  {
    id: "deep-winter",
    name: "Deep Winter",
    nameVi: "Mùa Đông Sâu",
    season: "Winter",
    undertone: "Cool / Dark-Neutral",
    undertoneVi: "Lạnh / Tối trung hòa",
    contrast: "Very High",
    contrastVi: "Rất cao",
    confidence: 96,
    cardGradient: "from-gray-900 via-slate-800 to-indigo-900",
    description:
      "Your dramatic, high-contrast beauty is best served by deep, rich, bold colors.",
    descriptionVi:
      "Vẻ đẹp tương phản mạnh, ấn tượng của bạn được phô diễn tốt nhất bởi những màu sắc đậm, phong phú và táo bạo.",
    detailedAnalysis:
      "You can carry the darkest colors effortlessly. Avoid light, muted, or warm shades that will dull your natural drama.",
    detailedAnalysisVi:
      "Bạn có thể dễ dàng mặc những màu tối nhất. Tránh các tông nhạt, mờ hoặc ấm sẽ làm giảm vẻ ấn tượng tự nhiên của bạn.",
    bestColors: [
      {
        name: "Jet Black",
        nameVi: "Đen tuyền",
        hex: "#101010",
      },
      { name: "Deep Navy", nameVi: "Navy đậm", hex: "#0A1628" },
      {
        name: "Deep Burgundy",
        nameVi: "Rượu vang đậm",
        hex: "#600020",
      },
      {
        name: "Midnight Blue",
        nameVi: "Xanh đêm",
        hex: "#1C2D5E",
      },
      {
        name: "Forest Green",
        nameVi: "Xanh rừng thẳm",
        hex: "#1A3822",
      },
      {
        name: "Deep Plum",
        nameVi: "Tím mận đậm",
        hex: "#4A1040",
      },
    ],
    avoidColors: [
      { name: "Warm Beige", nameVi: "Be ấm", hex: "#D4B896" },
      {
        name: "Light Peach",
        nameVi: "Đào nhạt",
        hex: "#FFDAB9",
      },
      {
        name: "Dusty Rose",
        nameVi: "Hồng dusty",
        hex: "#B87C7C",
      },
      {
        name: "Soft Yellow",
        nameVi: "Vàng nhạt",
        hex: "#F0E090",
      },
    ],
    recommendations: [
      {
        color1: "#101010",
        color2: "#1C2D5E",
        occasion: "Casual",
        occasionVi: "Thường ngày",
      },
      {
        color1: "#0A1628",
        color2: "#1A3822",
        occasion: "Work",
        occasionVi: "Công sở",
      },
      {
        color1: "#600020",
        color2: "#4A1040",
        occasion: "Evening",
        occasionVi: "Dự tiệc",
      },
    ],
    jewelry: ["Silver", "Onyx", "Dark Sapphire", "Hematite"],
    jewelryVi: ["Bạc", "Đá onyx", "Sapphire tối", "Hematit"],
    makeup: ["Deep Berry Lip", "Smokey Eye", "Cool Plum Blush"],
    makeupVi: [
      "Son berry đậm",
      "Khói mắt (smoky eye)",
      "Phấn má mận lạnh",
    ],
    sampleImage:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400",
  },
];