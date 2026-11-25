/** Corpo do POST /api/auth/login. Espelha o LoginRequest do backend. */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Resposta do login. Espelha o LoginResponse do backend. */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  /** Validade do token em segundos (86400 = 24 h). */
  expiresIn: number;
}
