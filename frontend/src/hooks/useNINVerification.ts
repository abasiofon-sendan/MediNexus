import { useState, useCallback, useEffect } from 'react';
import { authService } from '#/services/auth.service';
import type { NINDetailsResponse } from '#/types/api.types';

// Global state for Interswitch token (shared across components)
let globalInterswitchToken: string | null = null;
let tokenInitialized = false;

/**
 * React hook for handling NIN verification with Interswitch
 * Manages access token and NIN verification state
 */
export function useNINVerification() {
  const [interswitchToken, setInterswitchToken] = useState<string | null>(globalInterswitchToken);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedNINDetails, setVerifiedNINDetails] = useState<NINDetailsResponse['data'] | null>(null);

  /**
   * Initialize Interswitch token
   * Call this on app load
   */
  const initializeInterswitchToken = useCallback(async () => {
    if (globalInterswitchToken || isTokenLoading || tokenInitialized) {
      return globalInterswitchToken; // Already loaded or loading
    }

    setIsTokenLoading(true);
    setTokenError(null);

    try {
      const token = await authService.getInterswitchToken();
      globalInterswitchToken = token;
      setInterswitchToken(token);
      tokenInitialized = true;
      console.log('✅ Interswitch access token loaded successfully');
      return token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load Interswitch token';
      setTokenError(errorMessage);
      console.error('❌ Failed to load Interswitch token:', error);
      throw error;
    } finally {
      setIsTokenLoading(false);
    }
  }, [isTokenLoading]);

  /**
   * Verify NIN and get identity details
   * Returns auto-fill data for registration form
   */
  const verifyNIN = useCallback(async (nin: string) => {
    if (!globalInterswitchToken) {
      throw new Error('Interswitch token not available. Please refresh the page.');
    }

    // Validate NIN format (11 digits)
    const cleanNIN = nin.replace(/\D/g, '');
    if (cleanNIN.length !== 11) {
      throw new Error('NIN must be exactly 11 digits');
    }

    setIsVerifying(true);
    setVerificationError(null);
    setVerifiedNINDetails(null);

    try {
      const details = await authService.verifyNINAndGetDetails(cleanNIN, globalInterswitchToken);
      setVerifiedNINDetails(details);
      console.log('✅ NIN verification successful:', details);
      return details;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'NIN verification failed';
      setVerificationError(errorMessage);
      console.error('❌ NIN verification failed:', error);
      throw new Error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  }, []);

  /**
   * Clear verification state (for new verification)
   */
  const clearVerification = useCallback(() => {
    setVerificationError(null);
    setVerifiedNINDetails(null);
  }, []);

  /**
   * Get auto-fill data for registration form
   */
  const getAutoFillData = useCallback(() => {
    if (!verifiedNINDetails) return null;

    return {
      first_name: verifiedNINDetails.firstName,
      last_name: verifiedNINDetails.lastName,
      phone_number: verifiedNINDetails.phoneNumber,
      date_of_birth: verifiedNINDetails.dateOfBirth, // Already in YYYY-MM-DD format
      // Gender mapping if needed for future use
      gender: verifiedNINDetails.gender === 'M' ? 'Male' : 'Female',
    };
  }, [verifiedNINDetails]);

  /**
   * Format NIN for display (add dashes)
   */
  const formatNIN = useCallback((nin: string): string => {
    const cleanNIN = nin.replace(/\D/g, '');
    if (cleanNIN.length !== 11) return nin;
    
    return `${cleanNIN.slice(0, 5)}-${cleanNIN.slice(5, 8)}-${cleanNIN.slice(8)}`;
  }, []);

  /**
   * Validate NIN format
   */
  const isValidNIN = useCallback((nin: string): boolean => {
    const cleanNIN = nin.replace(/\D/g, '');
    return cleanNIN.length === 11;
  }, []);

  // Auto-initialize token on hook mount if not already done
  useEffect(() => {
    if (!tokenInitialized && !isTokenLoading) {
      initializeInterswitchToken().catch(() => {
        // Error already handled in the function
      });
    }
  }, [initializeInterswitchToken, isTokenLoading]);

  return {
    // Token state
    interswitchToken,
    isTokenLoading,
    tokenError,
    
    // Verification state
    isVerifying,
    verificationError,
    verifiedNINDetails,
    
    // Derived data
    autoFillData: getAutoFillData(),
    
    // Actions
    initializeInterswitchToken,
    verifyNIN,
    clearVerification,
    
    // Utilities
    formatNIN,
    isValidNIN,
  };
}