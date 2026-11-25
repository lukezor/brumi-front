import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/api/auth.interceptor';
import { erroInterceptor } from './core/api/erro.interceptor';

/**
 * Configuracao global da aplicacao: a lista de "providers" (servicos disponiveis para injecao).
 * ≈ o app.use(router).use(vuetify) do main.js do Vue, ou o angular.module('app', ['ngRoute']) do AngularJS.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Mostra no console erros nao tratados do navegador (gerado pelo ng new).
    provideBrowserGlobalErrorListeners(),
    // Rotas. withInMemoryScrolling: ao trocar de pagina, volta ao topo (como um site comum).
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    // HttpClient para falar com a API.
    //  - withFetch(): usa a API fetch() do navegador por baixo.
    //  - withInterceptors(): a ORDEM importa. Na ida, a requisicao passa pelo auth (poe o token) e depois pelo
    //    erro. Na volta, o erro trata a resposta. Se o erro repetir a requisicao, ela vai direto ao servidor.
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, erroInterceptor])),
  ],
};
