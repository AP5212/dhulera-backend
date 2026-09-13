export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  user_id: string;
}

export interface SafeUserResponse {
  id: string;
  name: string;
  email: string;
  mobileNumber: string | null;
  mobileCountryCode: string | null;
  createdAt?: Date;
  updatedAt?: Date | null;
}
