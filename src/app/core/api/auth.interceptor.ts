import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ArmazenamentoToken } from '../auth/armazenamento-token';

const PREFIXO_API = `${environment.apiUrl}/api/`;
const URL_LOGIN = `${environment.apiUrl}/api/auth/login`;

/**
 * Interceptor: uma função por onde TODA requisição do HttpClient passa antes de sair.
 * Este coloca "Authorization: Bearer <token>" nas chamadas à NOSSA API, se houver token.
 * ≈ api.interceptors.request.use(...) do axios no api.js antigo; $httpProvider.interceptors do AngularJS.
 *
 * Só para URLs da nossa API: o token nunca vai para outro site (um CDN, o Instagram...).
 * Nem no próprio login: lá ainda não há (ou não deve haver) token.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const ehNossaApi = req.url.startsWith(PREFIXO_API);
  if (!ehNossaApi || req.url === URL_LOGIN) {
    return next(req);
  }
  const token = inject(ArmazenamentoToken).obter();
  if (!token) {
    return next(req);
  }
  // Requisições são IMUTÁVEIS: clone() cria uma cópia com o cabeçalho a mais.
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
