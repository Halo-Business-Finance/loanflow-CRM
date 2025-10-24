# DEPRECATED: fortress-security.ts

## ⚠️ CRITICAL SECURITY NOTICE

**THIS FILE HAS BEEN DEPRECATED DUE TO CRITICAL SECURITY VULNERABILITIES**

### Why This File Was Deprecated

The `fortress-security.ts` file contained multiple **CRITICAL** security vulnerabilities that are completely unacceptable for a World Government and Military Grade Security system:

#### 1. **Client-Side Encryption Key Storage** (CRITICAL)
- **Lines 14-15, 43-60**: Generates and stores encryption keys in browser memory
- **Lines 312-314, 430-431, 447, 458**: Uses localStorage/sessionStorage for sensitive data
- **Risk**: Keys vulnerable to XSS attacks, browser inspection, and exfiltration

#### 2. **Insecure Key Generation**
- **Lines 43-61**: Multi-layer keys generated client-side
- **Lines 63-76**: Master key derived from device fingerprint (predictable)
- **Risk**: Weak entropy, reproducible keys, no HSM protection

#### 3. **Local Storage Abuse**
- **Lines 312-314**: Security incidents stored in localStorage
- **Lines 377, 429-430, 447, 455-460**: Sensitive data persisted client-side
- **Risk**: Data survives logout, accessible via DevTools, no encryption at rest

#### 4. **Session Token Exposure**
- **Lines 157-159, 168-184**: Session tokens stored in class properties
- **Lines 179**: Derives keys from access tokens
- **Risk**: Token leakage, replay attacks, no secure enclave

## What To Use Instead

### For Server-Side Encryption
Use the existing **Edge Functions**:
- `encryption-key-service`: Secure key generation and rotation
- `encrypt-data`: Server-side encryption with proper key management

### For Secure Storage
Use the existing **secure hooks**:
- `useEnhancedSecurity`: Client-side security with server validation
- `useSecureSessionStorage`: Server-side session data storage

### For Authentication
Use **Supabase Auth** with:
- JWT tokens (automatically managed)
- MFA enforcement (already implemented)
- Session security (active_sessions table)

## Migration Guide

If you were using `FortressSecurityManager`:

```typescript
// ❌ OLD (INSECURE)
import { fortress } from '@/lib/fortress-security';
await fortress.encryptUltraSecure(data, 'financial');
await fortress.secureStoreData(key, data, 'pii');

// ✅ NEW (SECURE)
import { enhancedSecureStorage } from '@/lib/enhanced-secure-storage';
await enhancedSecureStorage.setItem(key, data, { 
  serverSide: true,  // Encrypted and stored server-side
  autoCleanup: true,
  ttl: 480  // 8 hours
});
```

## DO NOT USE THIS FILE

**This file has been preserved for reference only. Do not import or use any code from fortress-security.ts in your application.**

**Date Deprecated**: 2025-01-24
**Reason**: Critical security vulnerabilities incompatible with military-grade requirements
**Replacement**: Use enhanced-secure-storage.ts and encryption Edge Functions
