import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { erroInterceptor } from '../../core/api/erro.interceptor';
import { provideLocalizacaoBrasil } from '../../core/localizacao';
import { Produto } from '../../core/modelos/produto';
import { Home } from './home';

const produto = (id: number, nome: string): Produto => ({
  id,
  nome,
  descricao: null,
  preco: 10,
  ativo: true,
  categorias: [],
  imagens: [],
});

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let servidor: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([erroInterceptor])),
        provideHttpClientTesting(),
        provideLocalizacaoBrasil(),
      ],
      // @defer: no teste, NÓS decidimos quando o bloco "aparece" (em vez de esperar a rolagem da tela).
      deferBlockBehavior: DeferBlockBehavior.Manual,
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    servidor = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => servidor.verify());

  const tela = () => fixture.nativeElement as HTMLElement;
  const responderVitrine = (conteudo: Produto[]) =>
    servidor
      .expectOne((r) => r.url === '/api/produtos')
      .flush({ conteudo, pagina: 0, tamanho: 6, totalElementos: conteudo.length, totalPaginas: 1 });

  it('o destaque tem o botão de pedido pelo WhatsApp e o de catálogo', () => {
    responderVitrine([]);
    expect(tela().querySelector('h1')?.textContent).toBe('BRUMI PRESENTES PERFUMADOS');
    const pedido = tela().querySelector<HTMLAnchorElement>('.destaque a[target="_blank"]')!;
    expect(pedido.href).toBe('https://wa.me/5519991337245?text=' + encodeURIComponent('Olá! Gostaria de fazer um pedido.'));
    expect(tela().querySelector('.destaque a[href="/produtos"]')).not.toBeNull();
  });

  it('pede à API os 6 produtos mais recentes', () => {
    const req = servidor.expectOne((r) => r.url === '/api/produtos');
    expect(req.request.params.get('size')).toBe('6');
    expect(req.request.params.get('sort')).toBe('id,desc');
    req.flush({ conteudo: [], pagina: 0, tamanho: 6, totalElementos: 0, totalPaginas: 0 });
  });

  it('mostra o carregando e depois um cartão por produto', async () => {
    expect(tela().querySelector('mat-progress-spinner')).not.toBeNull();

    responderVitrine([produto(9, 'Caneca'), produto(8, 'Cesta')]);
    await fixture.whenStable();

    expect(tela().querySelector('mat-progress-spinner')).toBeNull();
    const nomes = Array.from(tela().querySelectorAll('app-cartao-produto .nome')).map((n) => n.textContent);
    expect(nomes).toEqual(['Caneca', 'Cesta']);
    expect(tela().querySelector('.mais a[href="/produtos"]')?.textContent).toContain('Ver catálogo completo');
  });

  it('sem produtos, mostra uma mensagem em vez de uma vitrine vazia', async () => {
    responderVitrine([]);
    await fixture.whenStable();
    expect(tela().textContent).toContain('Em breve, novidades por aqui.');
    expect(tela().textContent).not.toContain('Ver catálogo completo');
  });

  it('se a API falhar, mostra a mensagem do erro', async () => {
    servidor.expectOne((r) => r.url === '/api/produtos').error(new ProgressEvent('error'), { status: 0 });
    await fixture.whenStable();
    expect(tela().querySelector('.erro')?.textContent).toContain('Não foi possível falar com o servidor');
  });

  it('os posts do Instagram só carregam quando a seção aparece (@defer)', async () => {
    responderVitrine([]);
    await fixture.whenStable();
    expect(tela().querySelectorAll('iframe').length).toBe(0);
    expect(tela().textContent).toContain('Os posts aparecem ao rolar a página.');

    // Simula a seção entrando na tela.
    const [blocoInstagram] = await fixture.getDeferBlocks();
    await blocoInstagram.render(DeferBlockState.Complete);

    const iframes = Array.from(tela().querySelectorAll('iframe'));
    expect(iframes.map((f) => f.getAttribute('src'))).toEqual([
      'https://www.instagram.com/reel/DKqZGZyIgKP/embed/',
      'https://www.instagram.com/p/DKqS6d-PzYy/embed/',
      'https://www.instagram.com/p/DKk9Iv7PoOO/embed/',
    ]);
  });
});
