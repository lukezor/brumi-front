import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AutenticacaoApiService } from './autenticacao-api.service';
import { CategoriaService } from './categoria.service';
import { ProdutoService, urlImagem } from './produto.service';

/**
 * Testa se cada método chama a URL e o método HTTP certos, com o corpo e os parâmetros certos.
 * HttpTestingController: "servidor de mentira". expectOne() confere que saiu UMA requisição para aquela URL;
 * flush() responde com o que quisermos. Nenhuma requisição sai de verdade.
 * ≈ o MockMvc do Spring, só que do lado de quem CHAMA.
 */
describe('Services da API', () => {
  let servidor: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    servidor = TestBed.inject(HttpTestingController);
  });

  // verify(): falha se sobrou alguma requisição que o teste não esperava.
  afterEach(() => servidor.verify());

  describe('CategoriaService', () => {
    it('listar faz GET /api/categorias e entrega a lista', async () => {
      const resultado = firstValueFrom(TestBed.inject(CategoriaService).listar());

      const req = servidor.expectOne('/api/categorias');
      expect(req.request.method).toBe('GET');
      req.flush([{ id: 1, nome: 'Cestas' }]);

      expect(await resultado).toEqual([{ id: 1, nome: 'Cestas' }]);
    });

    it('obter e criar', () => {
      const servico = TestBed.inject(CategoriaService);
      servico.obter(3).subscribe();
      servico.criar('Kits').subscribe();

      expect(servidor.expectOne('/api/categorias/3').request.method).toBe('GET');
      const criar = servidor.expectOne((r) => r.method === 'POST' && r.url === '/api/categorias');
      expect(criar.request.body).toEqual({ nome: 'Kits' });
    });
  });

  describe('ProdutoService', () => {
    it('listar sem filtros não manda parâmetros', () => {
      TestBed.inject(ProdutoService).listar().subscribe();
      const req = servidor.expectOne((r) => r.url === '/api/produtos');
      expect(req.request.params.keys()).toEqual([]);
    });

    it('listar manda só os filtros informados, com categorias repetidas', () => {
      TestBed.inject(ProdutoService)
        .listar({ nome: 'cesta', categorias: [1, 3], precoMin: 10, ativo: false, page: 2, size: 5, sort: 'preco,desc', precoMax: undefined })
        .subscribe();

      const req = servidor.expectOne((r) => r.url === '/api/produtos');
      expect(req.request.urlWithParams).toBe(
        '/api/produtos?nome=cesta&categorias=1&categorias=3&precoMin=10&ativo=false&page=2&size=5&sort=preco,desc',
      );
    });

    it('ignora nome vazio', () => {
      TestBed.inject(ProdutoService).listar({ nome: '' }).subscribe();
      expect(servidor.expectOne((r) => r.url === '/api/produtos').request.params.has('nome')).toBe(false);
    });

    it('obter, criar, atualizar e excluir usam os métodos e URLs certos', () => {
      const servico = TestBed.inject(ProdutoService);
      servico.obter(7).subscribe();
      servico.criar({ nome: 'Caneca', preco: 39.9, categoriasIds: [1] }).subscribe();
      servico.atualizar(7, { preco: 45 }).subscribe();
      servico.excluir(7).subscribe();

      expect(servidor.expectOne((r) => r.method === 'GET' && r.url === '/api/produtos/7')).toBeTruthy();
      expect(servidor.expectOne((r) => r.method === 'POST' && r.url === '/api/produtos').request.body).toEqual({
        nome: 'Caneca',
        preco: 39.9,
        categoriasIds: [1],
      });
      expect(servidor.expectOne((r) => r.method === 'PUT' && r.url === '/api/produtos/7').request.body).toEqual({ preco: 45 });
      expect(servidor.expectOne((r) => r.method === 'DELETE' && r.url === '/api/produtos/7')).toBeTruthy();
    });

    it('adicionarImagens envia FormData com um campo "imagens" por arquivo', () => {
      const a = new File(['a'], 'a.png', { type: 'image/png' });
      const b = new File(['b'], 'b.jpg', { type: 'image/jpeg' });
      TestBed.inject(ProdutoService).adicionarImagens(7, [a, b]).subscribe();

      const req = servidor.expectOne('/api/produtos/7/imagens');
      expect(req.request.method).toBe('POST');
      const corpo = req.request.body as FormData;
      expect(corpo).toBeInstanceOf(FormData);
      expect((corpo.getAll('imagens') as File[]).map((f) => f.name)).toEqual(['a.png', 'b.jpg']);
      // Sem Content-Type manual: o navegador define o multipart com o boundary.
      expect(req.request.headers.has('Content-Type')).toBe(false);
    });

    it('removerImagem faz DELETE pelo índice', () => {
      TestBed.inject(ProdutoService).removerImagem(7, 2).subscribe();
      expect(servidor.expectOne('/api/produtos/7/imagens/2').request.method).toBe('DELETE');
    });

    it('urlImagem junta o endereço da API ao caminho (vazio em desenvolvimento)', () => {
      expect(urlImagem('/uploads/abc.png')).toBe('/uploads/abc.png');
      // URL absoluta (API com url-publica configurada): usada como está.
      expect(urlImagem('https://fotos.exemplo.com/abc.png')).toBe('https://fotos.exemplo.com/abc.png');
    });
  });

  describe('AutenticacaoApiService', () => {
    it('login faz POST /api/auth/login com usuário e senha', async () => {
      const resposta = firstValueFrom(TestBed.inject(AutenticacaoApiService).login({ username: 'admin', password: 'x' }));

      const req = servidor.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'admin', password: 'x' });
      req.flush({ accessToken: 'tok', tokenType: 'Bearer', expiresIn: 86400 });

      expect((await resposta).accessToken).toBe('tok');
    });
  });
});
