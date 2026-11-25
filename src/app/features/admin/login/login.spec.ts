import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { erroInterceptor } from '../../../core/api/erro.interceptor';
import { AuthService } from '../../../core/auth/auth.service';
import { tokenFalso } from '../../../testes/sessao-falsa';
import { Login, retornoSeguro } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let servidor: HttpTestingController;
  let navegar: ReturnType<typeof vi.spyOn>;

  /** Monta a tela com os parâmetros de URL pedidos (?retorno=...&expirou=1). */
  async function abrir(parametros: Record<string, string> = {}): Promise<void> {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([erroInterceptor])),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(parametros) } } },
      ],
    }).compileComponents();
    servidor = TestBed.inject(HttpTestingController);
    // vi.spyOn: "espião" que registra as chamadas a router.navigateByUrl (e não navega de verdade).
    navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
  }

  afterEach(() => servidor.verify());

  const tela = () => fixture.nativeElement as HTMLElement;
  const campo = (nome: string) => tela().querySelector<HTMLInputElement>(`input[formcontrolname="${nome}"]`)!;
  async function preencher(nome: string, valor: string): Promise<void> {
    campo(nome).value = valor;
    campo(nome).dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }
  async function enviar(): Promise<void> {
    tela().querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
  }
  const responderLogin = (status: 200 | 401 | 0) => {
    const req = servidor.expectOne('/api/auth/login');
    if (status === 200) {
      req.flush({ accessToken: tokenFalso(), tokenType: 'Bearer', expiresIn: 86400 });
    } else if (status === 401) {
      req.flush({ status: 401, erro: 'Unauthorized', mensagem: 'Usuário ou senha inválidos' }, { status: 401, statusText: 'Unauthorized' });
    } else {
      req.error(new ProgressEvent('error'), { status: 0 });
    }
    return req;
  };

  it('campos vazios: mostra os erros e não chama a API', async () => {
    await abrir();
    await enviar();
    expect(tela().textContent).toContain('Informe o usuário');
    expect(tela().textContent).toContain('Informe a senha');
    servidor.expectNone('/api/auth/login');
  });

  it('login certo: envia usuário (sem espaços) e senha, guarda o token e vai para o painel', async () => {
    await abrir();
    await preencher('usuario', '  admin ');
    await preencher('senha', 'segredo');
    await enviar();

    const req = responderLogin(200);
    expect(req.request.body).toEqual({ username: 'admin', password: 'segredo' });
    await fixture.whenStable();
    expect(TestBed.inject(AuthService).autenticado()).toBe(true);
    expect(navegar).toHaveBeenCalledWith('/admin');
  });

  it('volta para a página que a pessoa queria (retorno)', async () => {
    await abrir({ retorno: '/admin?aba=categorias' });
    await preencher('usuario', 'admin');
    await preencher('senha', 'x');
    await enviar();
    responderLogin(200);
    await fixture.whenStable();
    expect(navegar).toHaveBeenCalledWith('/admin?aba=categorias');
  });

  it('senha errada: mostra a mensagem da API, apaga a senha e mantém o usuário', async () => {
    await abrir();
    await preencher('usuario', 'admin');
    await preencher('senha', 'errada');
    await enviar();
    responderLogin(401);
    await fixture.whenStable();

    expect(tela().querySelector('.erro')?.textContent).toContain('Usuário ou senha inválidos');
    expect(campo('senha').value).toBe('');
    expect(campo('usuario').value).toBe('admin');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('API fora do ar: mensagem de conexão', async () => {
    await abrir();
    await preencher('usuario', 'admin');
    await preencher('senha', 'x');
    await enviar();
    responderLogin(0);
    await fixture.whenStable();
    expect(tela().querySelector('.erro')?.textContent).toContain('Não foi possível falar com o servidor');
  });

  it('o botão fica desabilitado enquanto espera a resposta (sem login duplo)', async () => {
    await abrir();
    await preencher('usuario', 'admin');
    await preencher('senha', 'x');
    await enviar();
    expect(tela().querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
    await enviar(); // segundo clique
    responderLogin(200); // expectOne: só UMA requisição saiu
  });

  it('mostrar/esconder a senha', async () => {
    await abrir();
    expect(campo('senha').type).toBe('password');
    tela().querySelector<HTMLButtonElement>('button[aria-label="Mostrar senha"]')!.click();
    await fixture.whenStable();
    expect(campo('senha').type).toBe('text');
  });

  it('avisa quando veio de uma sessão expirada', async () => {
    await abrir({ expirou: '1' });
    expect(tela().querySelector('.aviso')?.textContent).toContain('Sua sessão expirou');
  });

  it('retorno só para páginas do admin (proteção contra "open redirect")', () => {
    expect(retornoSeguro('/admin')).toBe('/admin');
    expect(retornoSeguro('/admin/produtos/3')).toBe('/admin/produtos/3');
    for (const perigoso of ['https://site-falso.com', '//site-falso.com', '/produtos', '/administrador', 'javascript:alert(1)', null]) {
      expect(retornoSeguro(perigoso)).toBe('/admin');
    }
  });
});
