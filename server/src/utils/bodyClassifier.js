const BODY_TYPES = {
  female: {
    hourglass: {
      id: 'hourglass',
      label: 'Đồng hồ cát',
      emoji: '⌛',
      description: 'Vòng 1 và vòng 3 tương đương nhau, vòng 2 thon nhỏ hơn rõ rệt. Đây là vóc dáng cân đối và nữ tính nhất — phần trên và dưới hài hòa, eo được nhấn tự nhiên. Bạn có thể mặc hầu hết kiểu dáng trang phục.',
      characteristics: ['Vòng 1 ≈ Vòng 3', 'Vòng 2 nhỏ hơn ít nhất 25cm', 'Đường cong tự nhiên'],
      proportion: { shoulder: 1, waist: 0.7, hip: 1 },
      tips: 'Tôn eo với thắt lưng, wrap dress, đầm ôm',
    },
    pear: {
      id: 'pear',
      label: 'Hình Quả Lê',
      emoji: '🍐',
      description: 'Phần hông và đùi rộng hơn vai và ngực. Phần trên cơ thể thon gọn, phần dưới đầy đặn hơn. Vóc dáng này rất phổ biến ở phụ nữ châu Á — điểm mạnh là eo thon và vai thanh.',
      characteristics: ['Hông rộng hơn vai', 'Eo thon tự nhiên', 'Đùi và mông đầy'],
      proportion: { shoulder: 0.85, waist: 0.72, hip: 1 },
      tips: 'Làm nổi phần trên — áo có họa tiết, màu sáng; phần dưới màu tối',
    },
    apple: {
      id: 'apple',
      label: 'Hình Quả Táo',
      emoji: '🍎',
      description: 'Phần thân trên và bụng đầy đặn hơn phần hông và chân. Vai và ngực rộng, eo không rõ ràng, chân thường thon. Điểm mạnh là đôi chân và cánh tay đẹp.',
      characteristics: ['Vai rộng', 'Eo không rõ', 'Chân thon'],
      proportion: { shoulder: 1, waist: 0.95, hip: 0.88 },
      tips: 'Tạo eo giả — áo dài che bụng, quần ống suôn',
    },
    rectangle: {
      id: 'rectangle',
      label: 'Hình Chữ Nhật',
      emoji: '▭',
      description: 'Vai, eo và hông có số đo gần tương đương nhau, tạo nên đường thẳng từ trên xuống dưới. Vóc dáng thể thao, thanh mảnh — thường thấy ở người có chiều cao tốt.',
      characteristics: ['Vai ≈ Eo ≈ Hông', 'Dáng thẳng', 'Ít đường cong'],
      proportion: { shoulder: 1, waist: 0.88, hip: 0.95 },
      tips: 'Tạo đường cong — layered look, áo peplum, belt',
    },
    inverted_triangle: {
      id: 'inverted_triangle',
      label: 'Hình Tam Giác Ngược',
      emoji: '▽',
      description: 'Vai và ngực rộng hơn hông, tạo hình chữ V từ trên xuống. Vóc dáng này toát lên vẻ mạnh mẽ, tự tin — thường gặp ở người tập thể thao nhiều.',
      characteristics: ['Vai rộng hơn hông', 'Ngực nở', 'Hông thon'],
      proportion: { shoulder: 1, waist: 0.78, hip: 0.85 },
      tips: 'Cân bằng phần dưới — chân váy xòe, quần palazzo',
    },
  },
  male: {
    trapezoid: {
      id: 'trapezoid',
      label: 'Hình Thang',
      emoji: '🔺',
      description: 'Vai rộng hơn hông, ngực nở, eo thon vừa phải — đây là vóc dáng lý tưởng của nam giới. Tỷ lệ cơ thể cân đối, toát lên vẻ nam tính và khỏe mạnh.',
      characteristics: ['Vai rộng hơn hông', 'Ngực nở', 'Eo thon vừa'],
      proportion: { shoulder: 1, waist: 0.82, hip: 0.9 },
      tips: 'Mặc gì cũng đẹp — slim fit để tôn dáng nhất',
    },
    rectangle: {
      id: 'rectangle',
      label: 'Hình Chữ Nhật',
      emoji: '▭',
      description: 'Vai, eo và hông có số đo gần bằng nhau, tạo dáng thẳng đứng. Vóc dáng thể thao, dễ mặc đồ — hầu hết kiểu quần áo đều vừa.',
      characteristics: ['Vai ≈ Hông', 'Ít đường cong', 'Dáng thẳng'],
      proportion: { shoulder: 1, waist: 0.9, hip: 0.95 },
      tips: 'Áo có họa tiết ngang để tạo chiều rộng vai, quần slim',
    },
    oval: {
      id: 'oval',
      label: 'Hình Oval',
      emoji: '⭕',
      description: 'Phần bụng và thân trên đầy đặn hơn vai và hông. Vai hơi xuôi, bụng to hơn ngực. Điểm mạnh là cánh tay và chân thường thon.',
      characteristics: ['Bụng đầy', 'Vai xuôi', 'Chân thon'],
      proportion: { shoulder: 0.92, waist: 1, hip: 0.9 },
      tips: 'Áo sẫm màu, cổ V, quần thẳng — tạo chiều dài',
    },
    triangle: {
      id: 'triangle',
      label: 'Hình Tam Giác',
      emoji: '△',
      description: 'Hông rộng hơn vai, phần dưới cơ thể đầy hơn phần trên. Ít gặp ở nam giới — điểm mạnh là đôi chân khỏe và chắc.',
      characteristics: ['Hông rộng hơn vai', 'Đùi to', 'Vai hẹp'],
      proportion: { shoulder: 0.85, waist: 0.88, hip: 1 },
      tips: 'Áo có padding vai, màu sáng phần trên',
    },
  },
};

function classifyBodyType(gender, bust, waist, hips, height, weight) {
  const bmi = weight / Math.pow(height / 100, 2);

  if (gender === 'female') {
    const bustHipDiff    = Math.abs(bust - hips);
    const waistBustRatio = waist / bust;
    const waistHipRatio  = waist / hips;
    const hipBustDiff    = hips - bust;

    if (bustHipDiff <= 5 && waistBustRatio <= 0.75)  return 'hourglass';
    if (hipBustDiff > 3.5 && waistHipRatio < 0.75)   return 'pear';
    if (bust - hips > 3.5)                            return 'inverted_triangle';
    if (waistBustRatio > 0.87 || bmi > 28)            return 'apple';
    return 'rectangle';
  }

  if (gender === 'male') {
    const shoulderHipDiff = bust - hips;
    const waistHipRatio   = waist / hips;
    const bmiHigh         = bmi > 27;

    if (shoulderHipDiff > 3 && waistHipRatio < 0.88) return 'trapezoid';
    if (hips - bust > 3)                              return 'triangle';
    if (bmiHigh && waist > bust * 0.9)                return 'oval';
    return 'rectangle';
  }

  return 'rectangle';
}

module.exports = { BODY_TYPES, classifyBodyType };
