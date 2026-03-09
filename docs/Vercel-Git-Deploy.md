# Vercel and Render Deploy Notes

Frontend (`client/`) is deployed on Vercel.
Backend (`server/`) is deployed on Render.

## Vercel env vars
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_PAYMENT_MODE`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `NEXT_PUBLIC_CHATBOT_ENABLED`

## Render env vars
- `DATABASE_URL`
- `JWT_SECRET`
- `CLIENT_URL`
- `CLIENT_URLS`
- `CLIENT_URL_PATTERNS`
- `PAYMENT_MODE`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `NVIDIA_API_KEY`
- `CHATBOT_ENABLED`
- `CLINIC_PHONE`
- `CLINIC_ADDRESS`
- `CLINIC_HOURS`

## Notes
- Chatbot secrets stay on Render only. Do not expose `NVIDIA_API_KEY` to Vercel.
- The backend CORS config accepts exact origins from `CLIENT_URL` and `CLIENT_URLS`, plus preview patterns from `CLIENT_URL_PATTERNS`.
- Google OAuth uses Supabase on the client and SmileCare JWT cookies on the backend.
- Every successful payment verification should create the booking before the dashboard fetches it from `/api/bookings/my`.
