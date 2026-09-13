export type AuthUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  roleId?: string | null;
  status?: string | null;
};

export type AuthSession = {
  user: AuthUser;
  session: {
    id: string;
    userId: string;
    expiresAt: string | Date;
    token: string;
  };
};

export type AuthApiError = {
  code?: string;
  message?: string;
};
