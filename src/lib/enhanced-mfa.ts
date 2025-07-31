/**
 * Enhanced Multi-Factor Authentication Implementation
 * Provides multiple layers of authentication security
 */

import { supabase } from "@/integrations/supabase/client";
import { SecurityManager } from "./security";
import { fortress } from "./fortress-security";

export class EnhancedMFA {
  private static totpSecrets = new Map<string, string>();
  private static backupCodes = new Map<string, string[]>();

  // Generate TOTP secret for authenticator apps
  static async generateTOTPSecret(userId: string): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    // Generate base32 secret for TOTP
    const secret = this.generateBase32Secret();
    
    // Store encrypted secret
    const encryptedSecret = await SecurityManager.encryptSensitiveData(secret);
    this.totpSecrets.set(userId, encryptedSecret);
    
    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
    );
    
    // Store encrypted backup codes
    const encryptedBackupCodes = await Promise.all(
      backupCodes.map(code => SecurityManager.encryptSensitiveData(code))
    );
    this.backupCodes.set(userId, encryptedBackupCodes);
    
    // Generate QR code data
    const appName = 'LoanFlow';
    const qrCodeData = `otpauth://totp/${appName}:${userId}?secret=${secret}&issuer=${appName}`;
    
    return {
      secret,
      qrCode: qrCodeData,
      backupCodes
    };
  }

  // Verify TOTP code from authenticator app
  static async verifyTOTP(userId: string, code: string): Promise<boolean> {
    const encryptedSecret = this.totpSecrets.get(userId);
    if (!encryptedSecret) return false;
    
    try {
      const secret = await SecurityManager.decryptSensitiveData(encryptedSecret);
      return await this.validateTOTPCode(secret, code);
    } catch (error) {
      console.error('TOTP verification failed:', error);
      return false;
    }
  }

  // Generate backup codes
  static async generateBackupCodes(userId: string): Promise<string[]> {
    const backupCodes = Array.from({ length: 10 }, () => 
      Array.from(crypto.getRandomValues(new Uint8Array(6)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
    );
    
    const encryptedBackupCodes = await Promise.all(
      backupCodes.map(code => SecurityManager.encryptSensitiveData(code))
    );
    
    this.backupCodes.set(userId, encryptedBackupCodes);
    
    return backupCodes;
  }

  // Verify backup code
  static async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const encryptedBackupCodes = this.backupCodes.get(userId);
    if (!encryptedBackupCodes) return false;
    
    try {
      const backupCodes = await Promise.all(
        encryptedBackupCodes.map(encrypted => 
          SecurityManager.decryptSensitiveData(encrypted)
        )
      );
      
      const codeIndex = backupCodes.indexOf(code.toUpperCase());
      if (codeIndex === -1) return false;
      
      // Remove used backup code
      encryptedBackupCodes.splice(codeIndex, 1);
      this.backupCodes.set(userId, encryptedBackupCodes);
      
      return true;
    } catch (error) {
      console.error('Backup code verification failed:', error);
      return false;
    }
  }

  // Biometric authentication (if available)
  static async enableBiometricAuth(): Promise<boolean> {
    if (!('credentials' in navigator)) return false;
    
    try {
      // Check if WebAuthn is supported
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: {
            name: 'LoanFlow',
            id: window.location.hostname
          },
          user: {
            id: crypto.getRandomValues(new Uint8Array(64)),
            name: 'user@loanflow.com',
            displayName: 'LoanFlow User'
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' }
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          },
          timeout: 60000,
          attestation: 'direct'
        }
      });
      
      if (credential) {
        // Store biometric credential securely
        const pkCredential = credential as PublicKeyCredential;
        const credentialData = {
          id: credential.id,
          rawId: Array.from(new Uint8Array(pkCredential.rawId)),
          type: credential.type
        };
        
        await fortress.secureStoreData('biometric_credential', credentialData, 'business');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Biometric authentication setup failed:', error);
      return false;
    }
  }

  // Verify biometric authentication
  static async verifyBiometricAuth(): Promise<boolean> {
    if (!('credentials' in navigator)) return false;
    
    try {
      const storedCredential = await fortress.secureRetrieveData('biometric_credential', 'business');
      if (!storedCredential) return false;
      
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [{
            id: new Uint8Array(storedCredential.rawId),
            type: 'public-key'
          }],
          userVerification: 'required',
          timeout: 60000
        }
      });
      
      return !!assertion;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  // SMS verification
  static async sendSMSVerification(phoneNumber: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      // In production, integrate with SMS service
      await supabase.functions.invoke('secure-external-api', {
        body: {
          service: 'sms',
          action: 'send_verification',
          phone: phoneNumber,
          code
        }
      });
      
      // Store encrypted code temporarily
      const encryptedCode = await SecurityManager.encryptSensitiveData(code);
      localStorage.setItem(`_sms_code_${phoneNumber}`, encryptedCode);
      
      // Auto-expire in 5 minutes
      setTimeout(() => {
        localStorage.removeItem(`_sms_code_${phoneNumber}`);
      }, 300000);
      
      return code; // In production, don't return the actual code
    } catch (error) {
      console.error('SMS verification failed:', error);
      throw error;
    }
  }

  // Verify SMS code
  static async verifySMSCode(phoneNumber: string, code: string): Promise<boolean> {
    const encryptedStoredCode = localStorage.getItem(`_sms_code_${phoneNumber}`);
    if (!encryptedStoredCode) return false;
    
    try {
      const storedCode = await SecurityManager.decryptSensitiveData(encryptedStoredCode);
      const isValid = SecurityManager.secureCompare(code, storedCode);
      
      if (isValid) {
        localStorage.removeItem(`_sms_code_${phoneNumber}`);
      }
      
      return isValid;
    } catch (error) {
      console.error('SMS code verification failed:', error);
      return false;
    }
  }

  // Email verification with enhanced security
  static async sendEmailVerification(email: string): Promise<void> {
    const token = SecurityManager.generateSecureToken(32);
    const timestamp = Date.now();
    
    // Create secure verification package
    const verificationData = {
      email,
      token,
      timestamp,
      expiresAt: timestamp + (15 * 60 * 1000) // 15 minutes
    };
    
    const encryptedData = await SecurityManager.encryptSensitiveData(JSON.stringify(verificationData));
    localStorage.setItem(`_email_verification_${email}`, encryptedData);
    
    try {
      await supabase.functions.invoke('secure-external-api', {
        body: {
          service: 'email',
          action: 'send_verification',
          email,
          token
        }
      });
    } catch (error) {
      console.error('Email verification failed:', error);
      throw error;
    }
  }

  // Verify email token
  static async verifyEmailToken(email: string, token: string): Promise<boolean> {
    const encryptedData = localStorage.getItem(`_email_verification_${email}`);
    if (!encryptedData) return false;
    
    try {
      const decryptedData = await SecurityManager.decryptSensitiveData(encryptedData);
      const verificationData = JSON.parse(decryptedData);
      
      const isValidToken = SecurityManager.secureCompare(token, verificationData.token);
      const isNotExpired = Date.now() < verificationData.expiresAt;
      
      if (isValidToken && isNotExpired) {
        localStorage.removeItem(`_email_verification_${email}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Email token verification failed:', error);
      return false;
    }
  }

  // Hardware security key authentication
  static async registerSecurityKey(): Promise<boolean> {
    if (!('credentials' in navigator)) return false;
    
    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: {
            name: 'LoanFlow Security',
            id: window.location.hostname
          },
          user: {
            id: crypto.getRandomValues(new Uint8Array(64)),
            name: 'security-key-user',
            displayName: 'Security Key User'
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' }
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'cross-platform',
            userVerification: 'discouraged',
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: 'direct'
        }
      });
      
      if (credential) {
        const pkCredential = credential as PublicKeyCredential;
        const credentialData = {
          id: credential.id,
          rawId: Array.from(new Uint8Array(pkCredential.rawId)),
          type: credential.type
        };
        
        await fortress.secureStoreData('security_key', credentialData, 'business');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Security key registration failed:', error);
      return false;
    }
  }

  // Verify hardware security key
  static async verifySecurityKey(): Promise<boolean> {
    if (!('credentials' in navigator)) return false;
    
    try {
      const storedCredential = await fortress.secureRetrieveData('security_key', 'business');
      if (!storedCredential) return false;
      
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [{
            id: new Uint8Array(storedCredential.rawId),
            type: 'public-key'
          }],
          userVerification: 'discouraged',
          timeout: 60000
        }
      });
      
      return !!assertion;
    } catch (error) {
      console.error('Security key verification failed:', error);
      return false;
    }
  }

  // Adaptive authentication based on risk assessment
  static async getRequiredAuthMethods(riskLevel: number): Promise<string[]> {
    const methods = ['password'];
    
    if (riskLevel >= 30) methods.push('email');
    if (riskLevel >= 50) methods.push('sms');
    if (riskLevel >= 70) methods.push('totp');
    if (riskLevel >= 85) methods.push('biometric');
    if (riskLevel >= 95) methods.push('security_key');
    
    return methods;
  }

  // Private helper methods
  private static generateBase32Secret(): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bytes = crypto.getRandomValues(new Uint8Array(20));
    let secret = '';
    
    for (let i = 0; i < bytes.length; i++) {
      secret += alphabet[bytes[i] % alphabet.length];
    }
    
    return secret;
  }

  private static async validateTOTPCode(secret: string, code: string): Promise<boolean> {
    const time = Math.floor(Date.now() / 30000);
    
    // Check current time window and adjacent windows for clock drift
    for (let window = -1; window <= 1; window++) {
      const timeCode = await this.generateTOTPCode(secret, time + window);
      if (SecurityManager.secureCompare(code, timeCode)) {
        return true;
      }
    }
    
    return false;
  }

  private static async generateTOTPCode(secret: string, time: number): Promise<string> {
    // Simplified TOTP implementation - in production use a proper TOTP library
    const timeBytes = new ArrayBuffer(8);
    const timeView = new DataView(timeBytes);
    timeView.setUint32(4, time, false);
    
    // This is a simplified implementation
    // In production, use a proper HMAC-SHA1 implementation
    const hash = await crypto.subtle.digest('SHA-256', timeBytes);
    const hashArray = new Uint8Array(hash);
    
    const offset = hashArray[hashArray.length - 1] & 0xf;
    const binary = ((hashArray[offset] & 0x7f) << 24) |
                   ((hashArray[offset + 1] & 0xff) << 16) |
                   ((hashArray[offset + 2] & 0xff) << 8) |
                   (hashArray[offset + 3] & 0xff);
    
    const code = binary % 1000000;
    return code.toString().padStart(6, '0');
  }
}