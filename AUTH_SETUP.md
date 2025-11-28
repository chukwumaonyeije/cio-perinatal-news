# Authentication Setup

## Overview
The app now has a beautiful landing page with password protection. Users must sign in before accessing the dashboard.

## Default Password
**Default:** `perinatal2024`

## Changing the Password

### Option 1: Environment Variable (Recommended)
1. Add `DASHBOARD_PASSWORD` to your Vercel environment variables
2. Go to: https://vercel.com/chukwuma-onyeijes-projects/cio-perinatal-news/settings/environment-variables
3. Add new variable:
   - **Name:** `DASHBOARD_PASSWORD`
   - **Value:** Your custom password
   - **Environments:** Production, Preview, Development
4. Redeploy: `vercel --prod`

### Option 2: Edit Code
Edit `app/api/auth/login/route.ts` line 9:
```typescript
const correctPassword = process.env.DASHBOARD_PASSWORD || 'YOUR_NEW_PASSWORD';
```

## Features

### Landing Page (`/login`)
- Modern gradient design
- Feature showcase
- Password-protected access
- Responsive layout

### Dashboard (`/dashboard`)
- Protected route (requires authentication)
- Logout button in header
- All existing dashboard features

### Home Page (`/`)
- Automatically redirects to:
  - `/dashboard` if authenticated
  - `/login` if not authenticated

## Cookie Details
- **Name:** `auth`
- **Value:** `authenticated`
- **Duration:** 7 days
- **Security:** HttpOnly, Secure in production

## Testing

### Test Login
1. Go to: https://cio-perinatal-news.vercel.app
2. You'll be redirected to `/login`
3. Enter password: `perinatal2024` (or your custom password)
4. Click "Sign In"
5. You'll be redirected to `/dashboard`

### Test Logout
1. Click "Logout" button in dashboard header
2. You'll be redirected to `/login`
3. Cookie will be cleared

### Test Protection
1. Try accessing `/dashboard` directly without logging in
2. You'll be automatically redirected to `/login`

## Security Notes

### ⚠️ IMPORTANT: Change Default Password
The default password `perinatal2024` is publicly visible in the code. You should:
1. Set `DASHBOARD_PASSWORD` environment variable in Vercel
2. Use a strong, unique password
3. Never commit the actual password to git

### Current Security Level
- **Good for:** Personal use, internal tools, proof of concept
- **Not suitable for:** Production apps with sensitive data, multi-user systems

### To Enhance Security:
1. Use Supabase Auth with email/password
2. Add 2FA
3. Implement rate limiting on login endpoint
4. Add CAPTCHA for brute force protection
5. Use JWT tokens instead of simple cookie

## Troubleshooting

### Can't Login
- Check if `DASHBOARD_PASSWORD` is set in Vercel
- Try the default password: `perinatal2024`
- Clear browser cookies and try again
- Check browser console for errors

### Stuck in Redirect Loop
- Clear all cookies for the site
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Try incognito/private browsing mode

### Logout Not Working
- Check browser console for errors
- Manually clear the `auth` cookie in browser dev tools
- Hard refresh the page

## Files Modified

- `app/page.tsx` - Home redirect logic
- `app/login/page.tsx` - Landing/login page
- `app/dashboard/page.tsx` - Protected dashboard (moved from app/page.tsx)
- `app/api/auth/login/route.ts` - Login API
- `app/api/auth/logout/route.ts` - Logout API
- `middleware.ts` - Route protection
- `components/LogoutButton.tsx` - Logout button component

## Future Enhancements

Consider adding:
- [ ] "Remember me" option
- [ ] Session timeout warnings
- [ ] Multiple user accounts
- [ ] Role-based access control
- [ ] Login activity logs
- [ ] Password reset functionality
- [ ] Email-based authentication via Supabase
