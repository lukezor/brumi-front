import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

/**
 * Configuracao global da aplicacao: a lista de "providers" (servicos disponiveis para injecao).
 * ≈ o app.use(router).use(vuetify) do main.js do Vue, ou o angular.module('app', ['ngRoute']) do AngularJS.
 * Na Task 12 entra aqui o provideHttpClient(...) com os interceptors.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Mostra no console erros nao tratados do navegador (gerado pelo ng new).
    provideBrowserGlobalErrorListeners(),
    // Rotas. withInMemoryScrolling: ao trocar de pagina, volta ao topo (como um site comum).
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
  ],
};
