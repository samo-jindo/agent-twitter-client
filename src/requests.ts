import { Cookie, CookieJar } from 'tough-cookie';
import setCookie from 'set-cookie-parser';
import type { Headers as HeadersPolyfill } from 'headers-polyfill';

/**
 * Updates a cookie jar with the Set-Cookie headers from the provided Headers instance.
 * @param cookieJar The cookie jar to update.
 * @param headers The response headers to populate the cookie jar with.
 */
export async function updateCookieJar(
  cookieJar: CookieJar,
  headers: Headers | HeadersPolyfill,
) {
  const setCookieHeader = headers.get('set-cookie');
  console.debug(`[updateCookieJar] Set-Cookie header:`, setCookieHeader ? 'present' : 'not found');

  if (setCookieHeader) {
    const cookies = setCookie.splitCookiesString(setCookieHeader);
    console.debug(`[updateCookieJar] Parsed ${cookies.length} cookies from header`);

    for (const cookieString of cookies) {
      const cookie = Cookie.parse(cookieString);
      if (!cookie) {
        console.debug(`[updateCookieJar] Failed to parse cookie:`, cookieString);
        continue;
      }

      const url = `${cookie.secure ? 'https' : 'http'}://${cookie.domain}${cookie.path}`;
      console.debug(`[updateCookieJar] Setting cookie ${cookie.key}=${cookie.value.substring(0, 8)}... for ${url}`);

      try {
        await cookieJar.setCookie(cookie, url);
        console.debug(`[updateCookieJar] Successfully set cookie ${cookie.key}`);
      } catch (error) {
        console.debug(`[updateCookieJar] Failed to set cookie ${cookie.key}:`, error);
      }
    }
  } else if (typeof document !== 'undefined') {
    console.debug(`[updateCookieJar] No Set-Cookie header, trying document.cookie`);
    for (const cookie of document.cookie.split(';')) {
      const hardCookie = Cookie.parse(cookie);
      if (hardCookie) {
        console.debug(`[updateCookieJar] Setting cookie from document:`, hardCookie.key);
        await cookieJar.setCookie(hardCookie, document.location.toString());
      }
    }
  } else {
    console.debug(`[updateCookieJar] No Set-Cookie header and not in browser environment`);
  }
}
