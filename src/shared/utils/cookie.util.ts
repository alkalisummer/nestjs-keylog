export type CookieWriteOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  path?: string;
  domain?: string;
  maxAge?: number;
};

export function setCookie(res: unknown, name: string, value: string, options: CookieWriteOptions): void {
  const reply = res as { setCookie?: (n: string, v: string, o: CookieWriteOptions) => void };
  if (typeof reply.setCookie === 'function') {
    reply.setCookie(name, value, options);
  }
}

export function clearCookie(res: unknown, name: string, options?: Pick<CookieWriteOptions, 'path' | 'domain'>): void {
  const reply = res as { clearCookie?: (n: string, o?: Pick<CookieWriteOptions, 'path' | 'domain'>) => void };
  if (typeof reply.clearCookie === 'function') {
    reply.clearCookie(name, options);
  }
}

export function getCookie(req: unknown, name: string): string | undefined {
  const cookies = (req as { cookies?: Record<string, string> }).cookies;
  return cookies ? cookies[name] : undefined;
}

export function buildRefreshCookieOptions(): CookieWriteOptions {
  const maxAgeDays = parseInt(process.env.REFRESH_EXPIRES_DAYS || '14', 10);
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeDays * 24 * 60 * 60,
  };
}
