import { createCookieSessionStorage } from '@remix-run/node';

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
      name: '__session',
      httpOnly: true,
      maxAge: 3600 * 24 * 365,
      path: '/',
      sameSite: 'lax',
      secrets: ['QqbT6Hpmtd7sjoGL6N4w'],
      // secure: true,
    },
  });

export { getSession, commitSession, destroySession };
