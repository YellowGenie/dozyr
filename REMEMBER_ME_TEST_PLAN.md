# Remember Me Functionality Test Plan

## ✅ Implementation Status

### Frontend Changes Completed:
1. **Login Form**: Remember me checkbox is now functional and integrated with form validation
2. **Authentication Store**: Updated to handle remember me state and persist across sessions
3. **API Client**: Enhanced to track token timestamps and expiration
4. **Navigation**: Role-based navbar shows different items based on user role and authentication state
5. **Auth Provider**: Auto-checks authentication on app load for remember me sessions
6. **Persistent Storage**: Uses localStorage to maintain remember me preference and token

### Backend Requirements (See BACKEND_TODO.md):
- Update login endpoint to accept `remember` parameter
- Configure token expiration (24h standard, 30 days for remember me)
- Optional: Implement token refresh endpoint

## 🧪 Test Scenarios

### 1. Remember Me Login Test
1. Navigate to `/auth`
2. Enter valid credentials
3. **Check the "Remember me" checkbox**
4. Click "Sign In"
5. Verify you're redirected to `/dashboard`
6. Check localStorage for:
   - `auth_token`
   - `remember_me: "true"`
   - `token_timestamp`

### 2. Session Persistence Test
1. Complete "Remember Me Login" test
2. Close browser completely
3. Reopen browser and navigate to homepage (`/`)
4. **Expected**: User should still be logged in with role-based navbar
5. Navigate to `/dashboard` - should not redirect to login

### 3. Standard Login (No Remember Me) Test
1. Logout if logged in
2. Navigate to `/auth`
3. Enter valid credentials
4. **Leave "Remember me" checkbox unchecked**
5. Click "Sign In"
6. Check localStorage - should NOT contain `remember_me`
7. Close and reopen browser
8. **Expected**: User should be logged out and see login buttons

### 4. Role-Based Navigation Test
1. Login with different user roles (talent/manager/admin)
2. Check homepage navbar shows appropriate items:
   - **Talent**: Dashboard, Find Jobs, Profile, Messages
   - **Manager**: Dashboard, Post Jobs, Find Talent, My Jobs, Messages  
   - **Admin**: Admin Dashboard, Users, Jobs, Messages
3. Dropdown menu should show user info and logout option

### 5. Logout Test
1. Login with remember me enabled
2. Click logout from dropdown menu
3. Verify localStorage is cleared:
   - `auth_token` removed
   - `remember_me` removed
   - `token_timestamp` removed
4. Navbar should revert to non-authenticated state

### 6. Token Expiration Test (Client-Side)
1. Login with remember me
2. Manually modify `token_timestamp` in localStorage to simulate 31 days ago:
   ```javascript
   localStorage.setItem('token_timestamp', (Date.now() - (31 * 24 * 60 * 60 * 1000)).toString())
   ```
3. Refresh page
4. **Expected**: User should be logged out automatically

## 🔍 Manual Testing Checklist

- [ ] Remember me checkbox visible and functional
- [ ] Login with remember me persists across browser sessions  
- [ ] Login without remember me doesn't persist across sessions
- [ ] Role-based navbar shows correct items for each user role
- [ ] User dropdown shows profile info and logout option
- [ ] Logout clears all stored authentication data
- [ ] Token expiration logic works client-side
- [ ] Navigation between protected routes works when logged in
- [ ] Homepage navbar shows appropriate state (logged in vs logged out)

## 🚀 Ready for Production

The frontend implementation is complete and ready for testing. Once the backend changes are implemented (see BACKEND_TODO.md), the remember me functionality will work end-to-end with proper server-side token expiration.