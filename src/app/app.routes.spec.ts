import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

/**
 * Testa a TABELA DE ROTAS: cada URL carrega a pagina certa (de forma lazy) e troca o titulo da aba.
 * RouterTestingHarness: um "navegador de mentira" para rotas. navigateByUrl() navega e desenha a pagina.
 */
describe('Rotas', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    harness = await RouterTestingHarness.create();
  });

  function titulo(): string | undefined {
    return (harness.routeNativeElement as HTMLElement | null)?.querySelector('h1')?.textContent?.trim();
  }

  it('"/" mostra a pagina inicial', async () => {
    await harness.navigateByUrl('/');
    expect(titulo()).toBe('Brumi Presentes Perfumados');
    expect(TestBed.inject(Title).getTitle()).toBe('Brumi Presentes - Presentes Especiais');
  });

  it('"/produtos" mostra o catalogo e troca o titulo da aba', async () => {
    await harness.navigateByUrl('/produtos');
    expect(titulo()).toBe('Produtos');
    expect(TestBed.inject(Title).getTitle()).toBe('Produtos | Brumi Presentes');
  });

  it('"/admin" mostra a administracao', async () => {
    await harness.navigateByUrl('/admin');
    expect(titulo()).toBe('Administração');
    expect(TestBed.inject(Title).getTitle()).toBe('Administração | Brumi Presentes');
  });

  it('URL desconhecida volta para o inicio', async () => {
    await harness.navigateByUrl('/pagina-que-nao-existe');
    expect(TestBed.inject(Router).url).toBe('/');
    expect(titulo()).toBe('Brumi Presentes Perfumados');
  });

  it('as paginas sao carregadas sob demanda (lazy loading)', () => {
    const comComponente = routes.filter((r) => r.path !== '**');
    expect(comComponente.every((r) => typeof r.loadComponent === 'function' && !r.component)).toBe(true);
  });
});
