# CLAUDE.md — Clarity Personal Color AI

> Tài liệu này mô tả toàn bộ dự án cho Claude Code đọc mỗi khi bắt đầu session mới.
> Đặt file này ở root của project: `clarity/CLAUDE.md`

---

## Tổng quan dự án

**Clarity** là web app phân tích màu sắc cá nhân (personal color analysis) dựa trên AI, kết hợp gợi ý trang phục theo seasonal color theory và monetize qua affiliate TikTok Shop / Shopee.

**Giai đoạn hiện tại: Web App (Phase 1)**
Ưu tiên hoàn thiện web app chạy ổn định trên trình duyệt (desktop + mobile web) trước. iOS native build là Phase 2 sau khi web đã production-ready.

---

## Tech Stack

| Layer | Technology | Ghi chú |
|---|---|---|
| Frontend | React 18 (Vite) | Web app, responsive mobile-first |
| Backend | Node.js + Express | REST API, port 3001 |
| Database | MongoDB + Mongoose | Atlas cloud hoặc local |
| AI Service | Python Flask | Port 5001, gọi qua HTTP internal |
| AI Libraries | MediaPipe + OpenCV + NumPy | Rule-based MVP, không train model ngay |
| Auth | JWT (7 ngày) | Header: `Authorization: Bearer <token>` |
| Payment | VNPay | Sandbox trước, production sau |
| Affiliate | Shopee Affiliate + TikTok Shop | Link tracking qua URL param |
| Styling | CSS Modules hoặc Tailwind | Giữ nguyên Figma design |
| Deploy (web) | Vercel (client) + Railway (server) + Render (AI) | Phase 1 |
| Deploy (iOS) | React Native / Capacitor | Phase 2 — sau khi web stable |

---

## Cấu trúc thư mục

```
clarity/
├── CLAUDE.md                  ← file này
├── .env.example               ← template env vars
├── .gitignore
│
├── client/                    ← React frontend (Figma design)
│   ├── src/
│   │   ├── screens/           ← full-page screens
│   │   │   ├── ScanScreen.jsx         → upload ảnh, chụp camera
│   │   │   ├── ResultScreen.jsx       → kết quả season + mannequin
│   │   │   ├── WardrobeScreen.jsx     → tủ đồ cá nhân
│   │   │   ├── OnboardingScreen.jsx   → nhập số đo, chọn giới tính
│   │   │   └── UpgradeScreen.jsx      → freemium upsell + VNPay
│   │   ├── components/        ← reusable UI components
│   │   │   ├── MannequinView.jsx      → SVG mannequin + CSS 3D, 3 tab hoàn cảnh
│   │   │   ├── SwatchPicker.jsx       → bảng màu 6 swatch
│   │   │   ├── OutfitCard.jsx         → card gợi ý outfit
│   │   │   ├── MetaCard.jsx           → card hiển thị meta (da, khuôn mặt...)
│   │   │   └── PremiumGate.jsx        → wrapper block premium features
│   │   ├── hooks/
│   │   │   ├── useColorAnalysis.js    → gọi POST /api/analyze-face
│   │   │   ├── useWardrobe.js         → CRUD wardrobe
│   │   │   └── useAuth.js             → login, register, JWT storage
│   │   ├── api/
│   │   │   └── api.js                 → axios instance, BASE_URL từ env
│   │   ├── shared/
│   │   │   ├── seasonalPalettes.js    → 12 seasonal tone definitions + colors
│   │   │   └── colorRules.js          → outfit rule engine (season + occasion → outfit)
│   │   └── assets/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                    ← Node.js Express API
│   ├── src/
│   │   ├── app.js             ← Express setup, middleware, route mounting
│   │   ├── routes/
│   │   │   ├── auth.js              → /api/auth/*
│   │   │   ├── face.js              → /api/analyze-face, /api/result/:userId
│   │   │   ├── outfit.js            → /api/outfit/:season
│   │   │   ├── wardrobe.js          → /api/wardrobe
│   │   │   └── subscription.js      → /api/subscription (VNPay)
│   │   ├── controllers/
│   │   │   ├── faceController.js
│   │   │   ├── outfitController.js
│   │   │   ├── wardrobeController.js
│   │   │   └── subscriptionController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Scan.js
│   │   │   ├── Wardrobe.js
│   │   │   ├── Outfit.js
│   │   │   └── Subscription.js
│   │   ├── middleware/
│   │   │   ├── auth.js              → verify JWT
│   │   │   ├── freemium.js          → check subscriptionTier, block premium routes
│   │   │   └── upload.js            → multer, max 5MB, jpg/png only
│   │   └── integrations/
│   │       ├── shopeeAffiliate.js
│   │       ├── tiktokShop.js
│   │       ├── productRecommender.js
│   │       └── vnpay.js
│   └── package.json
│
├── ai/                        ← Python Flask microservice
│   ├── app.py                 ← Flask app, port 5001
│   ├── pipelines/
│   │   ├── skin_tone.py       → MediaPipe + OpenCV → LAB → seasonal classifier
│   │   ├── face_shape.py      → 468 landmarks → width/height ratios → 6 shapes
│   │   └── body_type.py       → số đo tay → 5 body types (MVP: không scan ảnh)
│   ├── classifiers/
│   │   └── seasonal_classifier.py   → rule-based, 12 seasonal tones
│   ├── venv/                  ← Python virtual environment (gitignore)
│   └── requirements.txt
│
└── shared/                    ← dùng chung client + server (copy hoặc symlink)
    ├── seasonalPalettes.js
    └── colorRules.js
```

---

## API Endpoints

```
AUTH
POST  /api/auth/register         body: { email, password, displayName }
POST  /api/auth/login            body: { email, password }
GET   /api/auth/me               header: Bearer token

ANALYSIS
POST  /api/analyze-face          multipart: image file + optional body measurements
                                 → calls AI service → saves Scan → returns result
GET   /api/result/:userId        → latest scan result
POST  /api/save-scan             body: scan data (manual override)

OUTFIT
GET   /api/outfit/:season        query: ?occasion=casual|office|party
                                 → returns outfit suggestions from colorRules.js

WARDROBE (premium required)
POST  /api/wardrobe              body: { name, color, category, imageUrl }
GET   /api/wardrobe/:userId
DELETE /api/wardrobe/:itemId

SUBSCRIPTION
GET   /api/subscription/:userId  → tier, daysRemaining
POST  /api/subscription/upgrade  → creates VNPay payment URL
GET   /api/subscription/callback → VNPay return URL, verify + upgrade user
```

---

## Data Models

### User
```js
{
  email: String (unique),
  passwordHash: String,
  displayName: String,
  avatarUrl: String,
  subscriptionTier: 'free' | 'premium',  // default: 'free'
  scanCount: Number,                       // default: 0
  lastScanDate: Date,
  createdAt, updatedAt
}
```

### Scan
```js
{
  userId: ObjectId (ref User),
  scanDate: Date,
  season: String,        // 12 types: autumn-warm, winter-cool, spring-bright...
  undertone: 'warm' | 'cool' | 'neutral',
  faceShape: 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond',
  bodyType: 'hourglass' | 'pear' | 'rectangle' | 'inverted-triangle' | 'apple',
  accuracy: Number,      // 0-100
  rawMetrics: Object     // LAB values, face ratios (debug/phase 2)
}
```

### Wardrobe
```js
{
  userId: ObjectId (ref User),
  items: [{
    name: String,
    color: String,         // hex
    category: 'top' | 'bottom' | 'shoes' | 'accessory',
    imageUrl: String,
    addedAt: Date,
    seasons: [String]      // compatible seasons
  }]
}
```

---

## Business Logic

### Freemium Model
| Feature | Free | Premium (79.000đ/tháng) |
|---|---|---|
| Scan màu da | ✅ 1 lần/tháng | ✅ Không giới hạn |
| Xem kết quả season | ✅ | ✅ |
| Gợi ý outfit cơ bản | ✅ 3 gợi ý | ✅ Đầy đủ |
| Mannequin 3 tab hoàn cảnh | ✅ (xem) | ✅ |
| Ướm tủ đồ lên mannequin | ❌ | ✅ |
| Phân tích makeup chi tiết | ❌ | ✅ |
| Affiliate links đầy đủ | ❌ (generic) | ✅ (personalized) |
| Lịch sử scan | ❌ | ✅ |
| Scan lại khi thay đổi | ❌ | ✅ |

### Rate Limiting
- Free: `POST /api/analyze-face` — max 1 request/tháng/user
- Premium: không giới hạn
- Implement bằng `scanCount` + `lastScanDate` trong User model

### Affiliate Logic
- Free user: trả về max 3 gợi ý, URL không có affiliate tag
- Premium user: trả về 12 gợi ý, URL có `aff_id` của Shopee/TikTok
- `productRecommender.js` merge kết quả 2 platform, sort theo colorMatch score

---

## AI Pipeline — Thứ tự xử lý

```
Image Upload
     │
     ├──→ [Thread 1] skin_tone.py
     │         MediaPipe detect face
     │         OpenCV white balance (CLAHE)
     │         Convert → LAB
     │         Rule classify → { season, undertone }
     │
     ├──→ [Thread 2] face_shape.py
     │         MediaPipe 468 landmarks
     │         Compute width/height/jaw ratios
     │         Rule classify → { faceShape }
     │
     └──→ [Thread 3] body_type.py (MVP: input số đo tay, không scan ảnh)
               bust/waist/hip ratios
               Rule classify → { bodyType }
                         │
                         ▼
              Merge results → colorRules.js
                         │
                         ▼
              { season, undertone, faceShape, bodyType, accuracy, palette, outfitRules }
```

**Phase 1 — Rule-based classifier** (~80% accuracy, deploy fast)
**Phase 2 — Custom TF model** (sau khi có data thật từ user)

---

## Seasonal Color Types (12 loại)

| Group | Types |
|---|---|
| Autumn | autumn-warm, autumn-deep, autumn-rich, autumn-muted |
| Winter | winter-cool, winter-dark, winter-bright, winter-clear |
| Spring | spring-warm, spring-light, spring-bright, spring-clear |
| Summer | summer-cool, summer-light, summer-soft, summer-muted |

> Mỗi type có: palette (6 màu chính), avoid (3-4 màu tránh), metallic (gold/silver/rose-gold), outfitRules theo occasion.

---

## Conventions & Rules cho Claude Code

### TUYỆT ĐỐI KHÔNG được làm
- Sửa bất kỳ file `.jsx` hoặc `.css` nào trong `client/src/` — design đã finalize từ Figma
- Thay đổi props hoặc interface của các component hiện có
- Thêm UI library mới vào client (Bootstrap, MUI, Antd...)
- Xóa file mà chưa hỏi confirm

### Luôn làm
- Wrap tất cả async/await trong try/catch
- Response format nhất quán: `{ success: true, data: {} }` hoặc `{ success: false, error: 'message' }`
- Đọc env vars từ `.env`, không hardcode credentials
- Comment bằng tiếng Anh, commit message bằng tiếng Anh
- Khi sửa server: không restart client, khi sửa client: không restart server

### Error handling
- Server: log với `console.error()`, không expose stack trace ra client
- AI service: nếu pipeline fail, trả về partial result + `accuracy` thấp, không crash toàn bộ
- Client: hiển thị friendly error message, không log stack trace ra UI

### Môi trường chạy
```bash
# Terminal 1 — Client
cd client && npm run dev          # Vite, port 5173

# Terminal 2 — Server
cd server && npm run dev          # Nodemon, port 3001

# Terminal 3 — AI Service
cd ai && source venv/bin/activate
python app.py                     # Flask, port 5001
```

---

## Roadmap

### Phase 1 — Web App (hiện tại)
- [x] UI design từ Figma
- [ ] Cấu trúc thư mục chuẩn
- [ ] Backend Node.js + MongoDB
- [ ] AI microservice Python (rule-based)
- [ ] Auth (JWT)
- [ ] Freemium logic
- [ ] VNPay integration (sandbox)
- [ ] Shopee + TikTok affiliate links
- [ ] Deploy: Vercel + Railway + Render
- [ ] Test trên mobile web (Chrome iOS/Android)

### Phase 2 — iOS App (sau khi web stable)
- [ ] Đánh giá Capacitor vs React Native
- [ ] Wrap web app với Capacitor trước (nhanh nhất)
- [ ] Nếu cần native: migrate sang React Native
- [ ] Camera permission, native image picker
- [ ] App Store submission

### Phase 3 — Growth
- [ ] Custom TF model (train trên data thật)
- [ ] Makeup analysis (5 yếu tố đầy đủ)
- [ ] Android app
- [ ] Social sharing (kết quả + outfit)

---

## Environment Variables

```bash
# server/.env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-here
PORT=3001
CLIENT_URL=http://localhost:5173

# AI Service
AI_SERVICE_URL=http://localhost:5001

# Affiliate
SHOPEE_AFF_ID=your-shopee-id
TIKTOK_AFF_ID=your-tiktok-id

# Payment
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3001/api/subscription/callback
```

---

*Cập nhật lần cuối: May 2026 — Phase 1 Web App*
