import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../modelos/autenticacao';

/**
 * Só a CHAMADA de login à API. Guardar o token, saber se está logado e sair ficam no AuthService (Task 15).
 * Separar "falar com a API" de "guardar estado" deixa cada parte mais simples de testar.
 */
@Injectable({ providedIn: 'root' })
export class AutenticacaoApiService {
  private readonly http = inject(HttpClient);

  /** POST /api/auth/login. 401 (ErroApi) se usuário ou senha estiverem errados. */
  login(credenciais: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, credenciais);
  }
}
