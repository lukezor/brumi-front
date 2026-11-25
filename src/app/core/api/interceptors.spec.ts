import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ArmazenamentoToken } from '../auth/armazenamento-token';
import { authInterceptor } from './auth.interceptor';
import { ErroApi } from './erro-api';
import { erroInterceptor } from './erro.interceptor';

/** Os dois interceptors juntos, na MESMA ordem do app.config.ts. */
describe('Interceptors (auth + erro)', () => {
  let http: HttpClient;
  let servidor: HttpTestingController;
  let tokens: ArmazenamentoToken;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor, erroInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    servidor = TestBed.inject(HttpTestingController);
    tokens = TestBed.inject(ArmazenamentoToken);
  });

  afterEach(() => servidor.verify());

  const comToken = () => tokens.salvar({ accessToken: 'tok-123', tokenType: 'Bearer', expiresIn: 3600 });

  // ---------- auth ----------

  it('sem token, a requisição sai sem Authorization', () => {
    http.get('/api/produtos').subscribe();
    expect(servidor.expectOne('/api/produtos').request.headers.has('Authorization')).toBe(false);
  });

  it('com token, coloca "Bearer <token>" nas chamadas à API', () => {
    comToken();
    http.post('/api/categorias', { nome: 'X' }).subscribe();
    expect(servidor.expectOne('/api/categorias').request.headers.get('Authorization')).toBe('Bearer tok-123');
  });

  it('nunca envia o token para outro site nem para o próprio login', () => {
    comToken();
    http.get('https://www.instagram.com/api/x').subscribe();
    http.post('/api/auth/login', {}).subscribe();
    expect(servidor.expectOne('https://www.instagram.com/api/x').request.headers.has('Authorization')).toBe(false);
    expect(servidor.expectOne('/api/auth/login').request.headers.has('Authorization')).toBe(false);
  });

  // ---------- erro ----------

  it('converte o ErroResponse da API num ErroApi com mensagem e campos', async () => {
    const resposta = firstValueFrom(http.post('/api/produtos', {}));
    servidor.expectOne('/api/produtos').flush(
      {
        status: 400,
        erro: 'Bad Request',
        mensagem: 'Dados inválidos',
        campos: [{ campo: 'nome', mensagem: 'O nome do produto é obrigatório' }],
      },
      { status: 400, statusText: 'Bad Request' },
    );

    const erro = await resposta.catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(ErroApi);
    expect((erro as ErroApi).status).toBe(400);
    expect((erro as ErroApi).message).toBe('Dados inválidos');
    expect((erro as ErroApi).mensagemDoCampo('nome')).toBe('O nome do produto é obrigatório');
  });

  it('servidor fora do ar vira uma mensagem amigável (status 0)', async () => {
    const resposta = firstValueFrom(http.get('/api/categorias'));
    servidor.expectOne('/api/categorias').error(new ProgressEvent('error'), { status: 0 });

    const erro = (await resposta.catch((e: unknown) => e)) as ErroApi;
    expect(erro.status).toBe(0);
    expect(erro.message).toContain('Não foi possível falar com o servidor');
  });

  it('API fora do ar atrás de um proxy (502 sem corpo da API) também é "sem conexão"', async () => {
    // Descoberto testando com o backend desligado: o proxy do ng serve responde 502, sem o ErroResponse.
    const resposta = firstValueFrom(http.get('/api/categorias'));
    servidor.expectOne('/api/categorias').flush('', { status: 502, statusText: 'Bad Gateway' });

    const erro = (await resposta.catch((e: unknown) => e)) as ErroApi;
    expect(erro.status).toBe(502);
    expect(erro.message).toContain('Não foi possível falar com o servidor');
  });

  it('500 com o corpo da API mantém a mensagem da API', async () => {
    const resposta = firstValueFrom(http.get('/api/categorias'));
    servidor
      .expectOne('/api/categorias')
      .flush({ status: 500, erro: 'Internal Server Error', mensagem: 'Ocorreu um erro inesperado.' }, { status: 500, statusText: 'Server Error' });

    expect(((await resposta.catch((e: unknown) => e)) as ErroApi).message).toBe('Ocorreu um erro inesperado.');
  });

  it('token vencido numa LEITURA: apaga o token e repete sem ele, sem o usuário ver erro', async () => {
    comToken();
    const resposta = firstValueFrom(http.get<string[]>('/api/categorias'));

    const primeira = servidor.expectOne('/api/categorias');
    expect(primeira.request.headers.get('Authorization')).toBe('Bearer tok-123');
    primeira.flush({ status: 401, erro: 'Unauthorized', mensagem: 'Token inválido ou expirado' }, { status: 401, statusText: 'Unauthorized' });

    const segunda = servidor.expectOne('/api/categorias');
    expect(segunda.request.headers.has('Authorization')).toBe(false);
    segunda.flush(['Cestas']);

    expect(await resposta).toEqual(['Cestas']);
    expect(tokens.temToken()).toBe(false);
    expect(localStorage.getItem('brumi.token')).toBeNull();
  });

  it('token vencido numa ESCRITA: apaga o token e devolve o 401 (sem repetir)', async () => {
    comToken();
    const resposta = firstValueFrom(http.delete('/api/produtos/1'));
    servidor
      .expectOne('/api/produtos/1')
      .flush({ status: 401, erro: 'Unauthorized', mensagem: 'Token inválido ou expirado' }, { status: 401, statusText: 'Unauthorized' });

    const erro = (await resposta.catch((e: unknown) => e)) as ErroApi;
    expect(erro.status).toBe(401);
    expect(erro.message).toBe('Token inválido ou expirado');
    expect(tokens.temToken()).toBe(false);
    servidor.expectNone('/api/produtos/1');
  });

  it('401 de senha errada no login não mexe em token nem repete', async () => {
    const resposta = firstValueFrom(http.post('/api/auth/login', { username: 'a', password: 'b' }));
    servidor
      .expectOne('/api/auth/login')
      .flush({ status: 401, erro: 'Unauthorized', mensagem: 'Usuário ou senha inválidos' }, { status: 401, statusText: 'Unauthorized' });

    const erro = (await resposta.catch((e: unknown) => e)) as ErroApi;
    expect(erro.message).toBe('Usuário ou senha inválidos');
  });
});
