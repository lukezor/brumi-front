import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { erroInterceptor } from '../../core/api/erro.interceptor';
import { provideLocalizacaoBrasil } from '../../core/localizacao';
import { Produto } from '../../core/modelos/produto';
import { ESPERA_DIGITACAO_MS } from './filtro-catalogo';
import { Produtos } from './produtos';

const produto = (id: number, nome: string): Produto => ({
  id,
  nome,
  descricao: `Descrição de ${nome}`,
  preco: 10 * id,
  ativo: true,
  categorias: [{ id: 1, nome: 'Cestas' }],
  imagens: [],
});

const pagina = (conteudo: Produto[], numero = 0, total = conteudo.length) => ({
  conteudo,
  pagina: numero,
  tamanho: 12,
  totalElementos: total,
  totalPaginas: Math.ceil(total / 12),
});

/** Espera de verdade o tempo do debounce (mais uma folga). */
const esperarDigitacao = () => new Promise((fim) => setTimeout(fim, ESPERA_DIGITACAO_MS + 50));

describe('Produtos (catálogo)', () => {
  let fixture: ComponentFixture<Produtos>;
  let servidor: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Produtos],
      providers: [provideHttpClient(withInterceptors([erroInterceptor])), provideHttpClientTesting(), provideLocalizacaoBrasil()],
    }).compileComponents();

    fixture = TestBed.createComponent(Produtos);
    servidor = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
    servidor.expectOne('/api/categorias').flush([
      { id: 1, nome: 'Cestas' },
      { id: 2, nome: 'Kits' },
    ]);
  });

  afterEach(() => servidor.verify());

  const tela = () => fixture.nativeElement as HTMLElement;
  const pedidoDeProdutos = (): TestRequest => servidor.expectOne((r) => r.url === '/api/produtos');
  const atualizar = () => fixture.whenStable();

  async function digitar(seletor: string, valor: string): Promise<void> {
    const campo = tela().querySelector<HTMLInputElement>(seletor)!;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
    await atualizar();
  }

  it('na abertura, pede a 1ª página com 12 itens ordenada por nome', async () => {
    const req = pedidoDeProdutos();
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('12');
    expect(req.request.params.get('sort')).toBe('nome,asc');
    expect(req.request.params.has('nome')).toBe(false);
    req.flush(pagina([produto(1, 'Caneca'), produto(2, 'Cesta')]));
    await atualizar();

    expect(tela().querySelector('.resumo')?.textContent).toBe('Mostrando 1–2 de 2 produtos');
    const nomes = Array.from(tela().querySelectorAll('app-cartao-produto .nome')).map((n) => n.textContent);
    expect(nomes).toEqual(['Caneca', 'Cesta']);
    // No catálogo, os cartões têm "Ver detalhes".
    expect(tela().querySelector('app-cartao-produto')?.textContent).toContain('Ver detalhes');
  });

  it('a busca espera o usuário parar de digitar (debounce) e volta para a 1ª página', async () => {
    pedidoDeProdutos().flush(pagina([produto(1, 'Caneca')]));

    await digitar('input[formcontrolname="busca"]', 'c');
    await digitar('input[formcontrolname="busca"]', 'ce');
    await digitar('input[formcontrolname="busca"]', 'cesta');
    servidor.expectNone((r) => r.url === '/api/produtos'); // ainda dentro dos 300 ms: nada saiu

    await esperarDigitacao();
    const req = pedidoDeProdutos(); // UMA requisição, só com o texto final
    expect(req.request.params.get('nome')).toBe('cesta');
    expect(req.request.params.get('page')).toBe('0');
    req.flush(pagina([]));
  });

  it('uma consulta nova cancela a anterior que ainda não respondeu (switchMap)', async () => {
    const primeira = pedidoDeProdutos(); // a da abertura, sem resposta ainda

    await digitar('input[formcontrolname="busca"]', 'kit');
    await esperarDigitacao();

    expect(primeira.cancelled).toBe(true);
    pedidoDeProdutos().flush(pagina([produto(2, 'Kit Perfumado')]));
    await atualizar();
    expect(tela().querySelector('app-cartao-produto .nome')?.textContent).toBe('Kit Perfumado');
  });

  it('mudar o mesmo filtro e voltar ao valor anterior não gera requisição', async () => {
    pedidoDeProdutos().flush(pagina([produto(1, 'Caneca')]));
    await digitar('input[formcontrolname="busca"]', 'x');
    await digitar('input[formcontrolname="busca"]', '');
    await esperarDigitacao();
    servidor.expectNone((r) => r.url === '/api/produtos');
  });

  it('faixa de preço invertida mostra o aviso e não busca', async () => {
    pedidoDeProdutos().flush(pagina([produto(1, 'Caneca')]));
    await digitar('input[formcontrolname="precoMin"]', '100');
    await digitar('input[formcontrolname="precoMax"]', '10');
    await esperarDigitacao();

    servidor.expectNone((r) => r.url === '/api/produtos');
    expect(tela().querySelector('.faixa-invalida')?.textContent).toContain('não pode ser maior que o máximo');

    await digitar('input[formcontrolname="precoMax"]', '500');
    await esperarDigitacao();
    const req = pedidoDeProdutos();
    expect(req.request.params.get('precoMin')).toBe('100');
    expect(req.request.params.get('precoMax')).toBe('500');
    req.flush(pagina([]));
  });

  it('paginador em português; trocar de página pede a página certa com o mesmo filtro', async () => {
    pedidoDeProdutos().flush(pagina([produto(1, 'Caneca')], 0, 30));
    await atualizar();
    expect(tela().querySelector('.mat-mdc-paginator-range-label')?.textContent?.trim()).toBe('1 – 12 de 30');

    tela().querySelector<HTMLButtonElement>('.mat-mdc-paginator-navigation-next')!.click();
    await atualizar();

    const req = pedidoDeProdutos();
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('sort')).toBe('nome,asc');
    req.flush(pagina([produto(13, 'Kit')], 1, 30));
    await atualizar();
    expect(tela().querySelector('.resumo')?.textContent).toBe('Mostrando 13–13 de 30 produtos');
  });

  it('sem paginador quando tudo cabe numa página', async () => {
    pedidoDeProdutos().flush(pagina([produto(1, 'Caneca')]));
    await atualizar();
    expect(tela().querySelector('mat-paginator')).toBeNull();
  });

  it('nenhum resultado: mensagem e botão de limpar que volta ao filtro inicial', async () => {
    pedidoDeProdutos().flush(pagina([produto(1, 'Caneca')]));
    await digitar('input[formcontrolname="busca"]', 'inexistente');
    await esperarDigitacao();
    pedidoDeProdutos().flush(pagina([]));
    await atualizar();
    expect(tela().textContent).toContain('Nenhum produto encontrado');

    Array.from(tela().querySelectorAll<HTMLButtonElement>('.estado button')).find((b) => b.textContent?.includes('Limpar'))!.click();
    await atualizar();
    await esperarDigitacao();
    const req = pedidoDeProdutos();
    expect(req.request.params.has('nome')).toBe(false);
    expect(tela().querySelector<HTMLInputElement>('input[formcontrolname="busca"]')!.value).toBe('');
    req.flush(pagina([produto(1, 'Caneca')]));
  });

  it('erro da API: mensagem e "Tentar novamente" repete a consulta', async () => {
    pedidoDeProdutos().error(new ProgressEvent('error'), { status: 0 });
    await atualizar();
    expect(tela().querySelector('.estado.erro')?.textContent).toContain('Não foi possível falar com o servidor');

    tela().querySelector<HTMLButtonElement>('.estado.erro button')!.click();
    await atualizar();
    pedidoDeProdutos().flush(pagina([produto(1, 'Caneca')]));
    await atualizar();
    expect(tela().querySelector('.estado.erro')).toBeNull();
    expect(tela().querySelector('app-cartao-produto')).not.toBeNull();
  });

  it('"Ver detalhes" abre o diálogo com o produto', async () => {
    pedidoDeProdutos().flush(pagina([produto(3, 'Cesta Premium')]));
    await atualizar();

    Array.from(tela().querySelectorAll<HTMLButtonElement>('app-cartao-produto button'))
      .find((b) => b.textContent?.includes('Ver detalhes'))!
      .click();
    await atualizar();

    // O diálogo é desenhado FORA do componente, num "overlay" no fim do <body>.
    const dialogo = document.querySelector('mat-dialog-container')!;
    expect(dialogo.querySelector('h2')?.textContent).toBe('Cesta Premium');
    expect(dialogo.textContent).toContain('Descrição de Cesta Premium');
    expect(dialogo.textContent).toContain('R$\u00a030,00');
  });
});
