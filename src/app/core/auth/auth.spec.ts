import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { entrarComoAdmin, tokenFalso } from '../../testes/sessao-falsa';
import { erroInterceptor } from '../api/erro.interceptor';
import { ErroApi } from '../api/erro-api';
import { AuthService, lerUsuarioDoToken } from './auth.service';
import { authGuard, visitanteGuard } from './guards';

describe('Autenticação (AuthService e guards)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([erroInterceptor])), provideHttpClientTesting()],
    });
  });

  const auth = () => TestBed.inject(AuthService);
  const servidor = () => TestBed.inject(HttpTestingController);

  describe('AuthService', () => {
    it('login guarda o token e passa a dizer quem está logado', async () => {
      expect(auth().autenticado()).toBe(false);

      const resultado = firstValueFrom(auth().login({ username: 'admin', password: 'x' }));
      servidor().expectOne('/api/auth/login').flush({ accessToken: tokenFalso('maria'), tokenType: 'Bearer', expiresIn: 86400 });
      await resultado;

      expect(auth().autenticado()).toBe(true);
      expect(auth().usuario()).toBe('maria');
      expect(auth().estaAutenticadoAgora()).toBe(true);
    });

    it('senha errada: o Observable falha com o ErroApi e nada é guardado', async () => {
      const resultado = firstValueFrom(auth().login({ username: 'admin', password: 'errada' }));
      servidor()
        .expectOne('/api/auth/login')
        .flush({ status: 401, erro: 'Unauthorized', mensagem: 'Usuário ou senha inválidos' }, { status: 401, statusText: 'Unauthorized' });

      const erro = await resultado.catch((e: unknown) => e);
      expect(erro).toBeInstanceOf(ErroApi);
      expect((erro as ErroApi).message).toBe('Usuário ou senha inválidos');
      expect(auth().autenticado()).toBe(false);
    });

    it('sair apaga o token', () => {
      entrarComoAdmin();
      expect(auth().autenticado()).toBe(true);
      auth().sair();
      expect(auth().autenticado()).toBe(false);
      expect(localStorage.getItem('brumi.token')).toBeNull();
    });

    it('lê o "sub" do token; token estragado dá null', () => {
      expect(lerUsuarioDoToken(tokenFalso('joao'))).toBe('joao');
      expect(lerUsuarioDoToken('isto-nao-e-jwt')).toBeNull();
      expect(lerUsuarioDoToken('a.@@@.c')).toBeNull();
    });
  });

  describe('guards', () => {
    /** Executa o guard como o roteador faria, para a URL pedida. */
    const rodar = (guard: typeof authGuard, url: string) =>
      TestBed.runInInjectionContext(() => guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot));

    it('authGuard sem login manda para o login, lembrando o retorno', () => {
      const resultado = rodar(authGuard, '/admin') as UrlTree;
      expect(resultado.toString()).toBe('/admin/login?retorno=%2Fadmin');
    });

    it('authGuard com login libera', () => {
      entrarComoAdmin();
      expect(rodar(authGuard, '/admin')).toBe(true);
    });

    it('authGuard com token VENCIDO manda para o login (e apaga o token)', () => {
      localStorage.setItem('brumi.token', JSON.stringify({ valor: tokenFalso(), expiraEm: Date.now() - 1000 }));
      expect((rodar(authGuard, '/admin') as UrlTree).toString()).toContain('/admin/login');
      expect(localStorage.getItem('brumi.token')).toBeNull();
    });

    it('visitanteGuard sem login: mostra o formulário', () => {
      expect(rodar(visitanteGuard, '/admin/login')).toBe(true);
    });

    it('visitanteGuard logado: vai direto ao painel', () => {
      // O token precisa existir ANTES de o serviço ser criado: ele lê o localStorage uma vez, ao nascer.
      entrarComoAdmin();
      expect((rodar(visitanteGuard, '/admin/login') as UrlTree).toString()).toBe('/admin');
    });
  });
});
