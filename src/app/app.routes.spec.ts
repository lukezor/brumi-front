import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { entrarComoAdmin } from './testes/sessao-falsa';

/**
 * Testa a TABELA DE ROTAS: cada URL carrega a pagina certa (de forma lazy) e troca o titulo da aba.
 * RouterTestingHarness: um "navegador de mentira" para rotas. navigateByUrl() navega e desenha a pagina.
 */
describe('Rotas', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      // A página de produtos chama a API ao abrir: o HttpClient de teste segura as requisições (sem responder).
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
    harness = await RouterTestingHarness.create();
  });

  function titulo(): string | undefined {
    return (harness.routeNativeElement as HTMLElement | null)?.querySelector('h1')?.textContent?.trim();
  }

  it('"/" mostra a pagina inicial', async () => {
    await harness.navigateByUrl('/');
    expect(titulo()).toBe('BRUMI PRESENTES PERFUMADOS');
    expect(TestBed.inject(Title).getTitle()).toBe('Brumi Presentes - Presentes Especiais');
  });

  it('"/produtos" mostra o catalogo e troca o titulo da aba', async () => {
    await harness.navigateByUrl('/produtos');
    expect(titulo()).toBe('Catálogo de produtos');
    expect(TestBed.inject(Title).getTitle()).toBe('Produtos | Brumi Presentes');
  });

  it('"/admin" sem login vai para o login, lembrando o retorno', async () => {
    await harness.navigateByUrl('/admin');
    expect(TestBed.inject(Router).url).toBe('/admin/login?retorno=%2Fadmin');
    expect(titulo()).toBe('Área administrativa');
    expect(TestBed.inject(Title).getTitle()).toBe('Entrar | Brumi Presentes');
  });

  it('"/admin" com login mostra o painel', async () => {
    entrarComoAdmin();
    await harness.navigateByUrl('/admin');
    expect(TestBed.inject(Router).url).toBe('/admin');
    expect(titulo()).toBe('Painel administrativo');
    expect(TestBed.inject(Title).getTitle()).toBe('Administração | Brumi Presentes');
  });

  it('"/admin/login" com login vai direto para o painel', async () => {
    entrarComoAdmin();
    await harness.navigateByUrl('/admin/login');
    expect(TestBed.inject(Router).url).toBe('/admin');
  });

  it('URL desconhecida volta para o inicio', async () => {
    await harness.navigateByUrl('/pagina-que-nao-existe');
    expect(TestBed.inject(Router).url).toBe('/');
    expect(titulo()).toBe('BRUMI PRESENTES PERFUMADOS');
  });

  it('as paginas sao carregadas sob demanda (lazy loading)', () => {
    const comComponente = routes.filter((r) => r.path !== '**');
    expect(comComponente.every((r) => typeof r.loadComponent === 'function' && !r.component)).toBe(true);
  });
});
