import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * GUARD: uma função que o roteador chama ANTES de entrar numa rota. Devolve:
 *   true                → pode entrar;
 *   um UrlTree (rota)   → não pode, vá para esta outra rota.
 * ≈ router.beforeEach(...) do Vue; o "resolve"/$routeChangeStart do AngularJS.
 *
 * Este protege as páginas do admin: sem login (ou com o token vencido), manda para o login, lembrando para onde
 * a pessoa queria ir (?retorno=/admin).
 *
 * Importante: o guard só esconde a TELA. Quem protege os DADOS é o backend (Task 7): sem token válido, a API
 * recusa qualquer escrita, mesmo que alguém burle o guard no navegador.
 */
export const authGuard: CanActivateFn = (_rota, estado) => {
  if (inject(AuthService).estaAutenticadoAgora()) {
    return true;
  }
  return inject(Router).createUrlTree(['/admin/login'], { queryParams: { retorno: estado.url } });
};

/** O contrário: quem já está logado não precisa ver o formulário de login. */
export const visitanteGuard: CanActivateFn = () => {
  return inject(AuthService).estaAutenticadoAgora() ? inject(Router).createUrlTree(['/admin']) : true;
};
