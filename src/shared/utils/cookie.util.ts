import { REFRESH_TOKEN } from '../lib/constants';
import type { FastifyReply } from 'fastify';
import '@fastify/cookie';

export type SameSite = 'lax' | 'strict' | 'none';

export type CookieWriteOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: SameSite;
  path?: string;
  domain?: string;
  maxAge?: number;
};

export function setCookie(res: FastifyReply, name: string, value: string, options: CookieWriteOptions): void {
  res.setCookie(name, value, options);
}

export function clearCookie(
  res: FastifyReply,
  name: string,
  options?: Pick<CookieWriteOptions, 'path' | 'domain'>,
): void {
  res.clearCookie(name, options);
}

export function getCookie(req: unknown, name: string): string | undefined {
  const cookies = (req as { cookies?: Record<string, string> }).cookies;
  return cookies ? cookies[name] : undefined;
}

export function buildRefreshCookieOptions(): CookieWriteOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAgeDays = REFRESH_TOKEN.EXPIRES_DAYS;
  const configuredSameSite = isProduction ? (REFRESH_TOKEN.SAMESITE as SameSite) : 'lax';
  const configuredSecure = isProduction ? REFRESH_TOKEN.SECURE : false;
  const isCrossSite = Boolean(process.env.CORS_ORIGIN);
  const sameSite: SameSite = configuredSameSite ?? (isCrossSite && isProduction ? 'none' : 'lax');
  const secure: boolean = configuredSecure ?? sameSite === 'none';
  return {
    httpOnly: true,
    ...(secure && { secure }),
    sameSite,
    path: '/',
    maxAge: maxAgeDays * 24 * 60 * 60,
  };
}
