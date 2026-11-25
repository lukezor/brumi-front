import { Routes } from '@angular/router';
import { authGuard, visitanteGuard } from './core/auth/guards';

/**
 * Tabela de rotas: qual componente aparece em qual URL.
 * ≈ o "routes" do router/index.js do Vue, ou o $routeProvider.when(...) do AngularJS.
 *
 * loadComponent + import(): LAZY LOADING. O codigo de cada pagina vira um arquivo separado, baixado so
 * quando o usuario visita aquela pagina. Quem so ve o catalogo nunca baixa o codigo do painel admin.
 *
 * title: o Angular troca o titulo da aba do navegador automaticamente ao navegar.
 * canActivate: guards que decidem se a rota pode ser aberta (Task 15).
 */
export const routes: Routes = [
  {
    path: '',
    title: 'Brumi Presentes - Presentes Especiais',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'produtos',
    title: 'Produtos | Brumi Presentes',
    loadComponent: () => import('./features/produtos/produtos').then((m) => m.Produtos),
  },
  {
    path: 'admin/login',
    title: 'Entrar | Brumi Presentes',
    canActivate: [visitanteGuard],
    loadComponent: () => import('./features/admin/login/login').then((m) => m.Login),
  },
  {
    path: 'admin',
    title: 'Administração | Brumi Presentes',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
  },
  // Qualquer outra URL volta para o inicio. Tem que ser a ULTIMA: as rotas sao testadas na ordem.
  { path: '**', redirectTo: '' },
];
