// src/lib/upiUtils.ts

/* ---------- Extractors: Parse UPI data from scanned text ---------- */
// Tries to find a UPI payment string (upi://pay?...)
export const extractUpiParts = (raw: string | null): { rawUpiUri: string, query: string } | null => {
  if (!raw) return null;
  const s = String(raw).trim();

  // Look for a standard UPI URI
  const upiMatch = s.match(/upi:\/\/pay\?[^#\s]+/i);
  if (upiMatch) {
    const rawUpiUri = upiMatch[0];
    const query = rawUpiUri.split('?')[1] || ''; // Get parameters after '?'
    return { rawUpiUri, query };
  }

  // Look for UPI URI embedded in an Android Intent string
  const intentEmbedded = s.match(/upi:\/\/pay\?[^;"\s]+/i);
  if (intentEmbedded) {
    const rawUpiUri = intentEmbedded[0];
    const query = rawUpiUri.split('?')[1] || '';
    return { rawUpiUri, query };
  }

  // Look for just the query parameters (pa=...&pn=...)
  if (/(^|[?&])pa=/.test(s)) {
    const query = s.includes('?') ? s.split('?').pop() || '' : s;
    const rawUpiUri = `upi://pay?${query}`; // Reconstruct the URI
    return { rawUpiUri, query };
  }

  // If none found, return null
  return null;
};

// Extracts the Payee Name (pn) from the UPI query parameters
export const pickMeta = (upiQuery: string): { pn: string } | null => {
  try {
    const p = new URLSearchParams(upiQuery);
    const pn = p.get('pn') || ''; // Get 'pn' parameter
    return { pn };
  } catch {
    return null;
  }
};

/* ---------- String-safe parameter setter for UPI query ---------- */
// Safely adds or replaces a parameter in the query string
export const setParamInQuery = (q: string, key: string, value: string | number): string => {
  const enc = encodeURIComponent(String(value)); // Encode the new value
  const re = new RegExp(`(^|&)${key}=([^&]*)`, 'i'); // Regex to find existing key
  if (re.test(q)) {
    // If key exists, replace its value
    return q.replace(re, (m, p1) => `${p1}${key}=${enc}`);
  }
  // If key doesn't exist, append it
  return q.length ? `${q}&${key}=${enc}` : `${key}=${enc}`;
};

// Ensures the currency code 'cu=INR' is present in the query
export const ensureCurrencyINR = (q: string): string => {
  if (/(^|&)cu=([^&]*)/i.test(q)) return q; // If 'cu' exists, do nothing
  return q.length ? `${q}&cu=INR` : 'cu=INR'; // Otherwise, add it
};

/* ---------- Platform helpers ---------- */
// Detects if the code is running on Android or iOS
const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent || '');
const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent || '');

/* ---------- Open GPay ONLY (no app chooser) ---------- */
// Attempts to open the scanned UPI link specifically in Google Pay
export const openGooglePayOnly = (upiQueryWithAmt: string): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Define URLs for different platforms
  const gpayScheme = `gpay://upi/pay?${upiQueryWithAmt}`;
  const tezScheme = `tez://upi/pay?${upiQueryWithAmt}`; // Legacy Google Pay scheme
  const androidIntent =
    `intent://pay?${upiQueryWithAmt}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;` +
    `S.browser_fallback_url=${encodeURIComponent('https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user')};end`;

  // Android specific flow
  if (isAndroid) {
    let switched = false;
    const onHide = () => { switched = true; cleanup(); };
    const cleanup = () => document.removeEventListener('visibilitychange', onHide);
    document.addEventListener('visibilitychange', onHide, { once: true });

    // Try the most reliable method first (Android Intent)
    window.location.href = androidIntent;

    // Fallback mechanism if Intent fails after a delay
    setTimeout(() => {
      if (!switched && document.visibilityState === 'visible') {
        window.location.href = gpayScheme; // Try gpay:// scheme
        setTimeout(() => { // Final check
          if (!switched && document.visibilityState === 'visible') {
            alert('Could not open Google Pay. Please install/enable GPay and try again.');
          }
          cleanup();
        }, 900);
      } else {
        cleanup();
      }
    }, 1200);
    return;
  }

  // iOS specific flow
  if (isIOS) {
    let switched = false;
    const onHide = () => { switched = true; cleanup(); };
    const cleanup = () => document.removeEventListener('visibilitychange', onHide);
    document.addEventListener('visibilitychange', onHide, { once: true });

    // Try gpay:// first
    window.location.href = gpayScheme;
    setTimeout(() => { // Fallback to tez://
      if (!switched && document.visibilityState === 'visible') {
        window.location.href = tezScheme;
        setTimeout(() => { // Final check
          if (!switched && document.visibilityState === 'visible') {
            alert('Could not open Google Pay. Make sure it’s installed.');
          }
          cleanup();
        }, 900);
      } else {
        cleanup();
      }
    }, 900);
    return;
  }

  // If not Android or iOS
  alert('This flow requires Google Pay on a mobile device.');
};