interface JwtPayload {
  user_id: number | null;
  is_admin: boolean;
}

const decodePayload = (token: string): Record<string, unknown> | null => {
  try {
    const base64Payload = token.split('.')[1];
    if (!base64Payload) return null;
    return JSON.parse(atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

export const parseJwtUserId = (token: string): number | null => {
  const payload = decodePayload(token);
  if (!payload) return null;
  const id = payload.user_id;
  return typeof id === 'number' ? id : null;
};

export const parseJwtPayload = (token: string): JwtPayload => {
  const payload = decodePayload(token);
  if (!payload) return { user_id: null, is_admin: false };
  return {
    user_id: typeof payload.user_id === 'number' ? payload.user_id : null,
    is_admin: payload.is_admin === true,
  };
};
