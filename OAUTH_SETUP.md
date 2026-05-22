# OAuth Credentials Setup

## Google OAuth
1. Vào https://console.cloud.google.com
2. Tạo project mới hoặc chọn project có sẵn
3. APIs & Services → Credentials → Create Credentials → OAuth Client ID
4. Application type: Web application
5. Authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback`  (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
6. Copy Client ID và Client Secret vào `server/.env`

## Facebook OAuth
1. Vào https://developers.facebook.com
2. My Apps → Create App → Consumer
3. Add Facebook Login product
4. Settings → Basic → copy App ID và App Secret
5. Facebook Login → Settings → Valid OAuth Redirect URIs:
   - `http://localhost:3001/api/auth/facebook/callback`
6. Copy vào `server/.env`

## Test accounts
- **Google**: dùng tài khoản Google thật, localhost được phép mặc định
- **Facebook**: phải thêm tester account trong App Roles → Testers khi app chưa được review bởi Facebook

## server/.env entries to add
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3001/api/auth/facebook/callback

CLIENT_URL=http://localhost:5173
```
