import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ArmazenamentoToken } from '../../core/auth/armazenamento-token';
import { entrarComoAdmin } from '../../testes/sessao-falsa';
import { Admin } from './admin';

describe('Admin (painel)', () => {
  let fixture: ComponentFixture<Admin>;
  let navegar: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    localStorage.clear();
    entrarComoAdmin('maria');
    await TestBed.configureTestingModule({ imports: [Admin], providers: [provideRouter([])] }).compileComponents();
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(Admin);
    await fixture.whenStable();
  });

  const tela = () => fixture.nativeElement as HTMLElement;

  it('mostra quem está logado', () => {
    expect(tela().textContent).toContain('Conectado como maria');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('"Sair" apaga o token e volta ao login, sem o aviso de sessão expirada', async () => {
    Array.from(tela().querySelectorAll('button')).find((b) => b.textContent?.includes('Sair'))!.click();
    await fixture.whenStable();

    expect(localStorage.getItem('brumi.token')).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/admin/login'], { queryParams: {} });
  });

  it('se o token sumir sozinho (401 numa escrita), volta ao login COM o aviso', async () => {
    // É o que o erroInterceptor faz ao receber 401 de uma escrita (Task 12).
    TestBed.inject(ArmazenamentoToken).limpar();
    await fixture.whenStable();

    expect(navegar).toHaveBeenCalledWith(['/admin/login'], { queryParams: { expirou: 1 } });
  });
});
