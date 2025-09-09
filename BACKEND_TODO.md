# Backend Changes Required for Remember Me Functionality

## 1. Update Login Endpoint (/auth/login)

The backend should accept a `remember` boolean parameter in the login request body and adjust token expiration accordingly:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "remember": true
}
```

## 2. Token Expiration Configuration

- **Standard login**: Token should expire in 24 hours (or current default)
- **Remember me login**: Token should expire in 30 days (1 month)

### Implementation Suggestions:

```javascript
// Example backend logic
const login = async (req, res) => {
  const { email, password, remember } = req.body
  
  // Validate credentials...
  
  const expirationTime = remember 
    ? 30 * 24 * 60 * 60 // 30 days in seconds
    : 24 * 60 * 60      // 24 hours in seconds
  
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: expirationTime }
  )
  
  res.json({
    user,
    token,
    expires_in: expirationTime,
    remember_me: remember
  })
}
```

## 3. Token Refresh Endpoint (Optional but Recommended)

Create a `/auth/refresh` endpoint that can extend tokens for remember me sessions:

```javascript
const refreshToken = async (req, res) => {
  const { token } = req.body
  
  // Verify current token
  const decoded = jwt.verify(token, JWT_SECRET)
  
  // Check if it's a remember me session
  const rememberMe = req.headers['x-remember-me'] || false
  
  if (rememberMe) {
    // Issue new token with extended expiration
    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      JWT_SECRET,
      { expiresIn: 30 * 24 * 60 * 60 }
    )
    
    res.json({ token: newToken, expires_in: 30 * 24 * 60 * 60 })
  } else {
    res.status(400).json({ error: 'Token refresh not available for this session' })
  }
}
```

## 4. Database Changes (if needed)

Consider storing remember me sessions in the database for better tracking:

```sql
ALTER TABLE users ADD COLUMN remember_me_expires DATETIME;
```

## 5. Security Considerations

- Remember me tokens should be revoked on password change
- Consider implementing token rotation for long-lived sessions
- Log remember me logins separately for security auditing
- Implement session invalidation on suspicious activity

## Current Frontend Implementation

The frontend has been updated to:
- ✅ Send `remember` parameter in login requests
- ✅ Store remember me preference in localStorage
- ✅ Persist authentication state across browser sessions
- ✅ Show role-based navigation when authenticated
- ✅ Auto-check authentication on app load for remember me sessions

**Next Steps**: Backend team should implement the server-side changes described above.