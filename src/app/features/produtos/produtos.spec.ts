import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { erroInterceptor } from '../../core/api/erro.interceptor';
import { Produtos } from './produtos';

/** A página usando os services de verdade, com o "servidor de mentira" no lugar da API. */
describe('Produtos (provisória)', () => {
  let fixture: ComponentFixture<Produtos>;
  let servidor: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Produtos],
      providers: [provideHttpClient(withInterceptors([erroInterceptor])), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Produtos);
    servidor = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => servidor.verify());

  const tela = () => fixture.nativeElement as HTMLElement;

  it('mostra "Carregando…" enquanto a API não responde', () => {
    expect(tela().textContent).toContain('Carregando…');
    servidor.expectOne('/api/categorias').flush([]);
    servidor.expectOne((r) => r.url === '/api/produtos').flush({ conteudo: [], pagina: 0, tamanho: 1, totalElementos: 0, totalPaginas: 0 });
  });

  it('pede as duas coisas ao mesmo tempo e mostra o resumo e as categorias', async () => {
    servidor.expectOne('/api/categorias').flush([
      { id: 1, nome: 'Cestas' },
      { id: 2, nome: 'Kits' },
    ]);
    const produtos = servidor.expectOne((r) => r.url === '/api/produtos');
    expect(produtos.request.params.get('size')).toBe('1');
    produtos.flush({ conteudo: [], pagina: 0, tamanho: 1, totalElementos: 4, totalPaginas: 4 });
    await fixture.whenStable();

    expect(tela().querySelector('.resumo')?.textContent).toContain('4 produtos ativos em 2 categorias');
    const chips = Array.from(tela().querySelectorAll('mat-chip')).map((c) => c.textContent?.trim());
    expect(chips).toEqual(['Cestas', 'Kits']);
  });

  it('mostra a mensagem do ErroApi se a API estiver fora do ar', async () => {
    servidor.expectOne('/api/categorias').error(new ProgressEvent('error'), { status: 0 });
    // forkJoin cancela a outra requisição quando uma falha.
    servidor.match((r) => r.url === '/api/produtos');
    await fixture.whenStable();

    expect(tela().querySelector('.erro')?.textContent).toContain('Não foi possível falar com o servidor');
    expect(tela().textContent).not.toContain('Carregando…');
  });
});
