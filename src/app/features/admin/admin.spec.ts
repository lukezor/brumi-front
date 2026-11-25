import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { ArmazenamentoToken } from '../../core/auth/armazenamento-token';
import { provideLocalizacaoBrasil } from '../../core/localizacao';
import { entrarComoAdmin } from '../../testes/sessao-falsa';
import { Admin } from './admin';

const CANECA = { id: 1, nome: 'Caneca', descricao: null, preco: 39.9, ativo: true, categorias: [], imagens: [] };

describe('Admin (painel)', () => {
  let fixture: ComponentFixture<Admin>;
  let servidor: HttpTestingController;
  let navegar: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    localStorage.clear();
    entrarComoAdmin('maria');
    await TestBed.configureTestingModule({
      imports: [Admin],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideLocalizacaoBrasil()],
    }).compileComponents();
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    servidor = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Admin);
    await fixture.whenStable();
    responderCarga();
    await fixture.whenStable();
  });

  const tela = () => fixture.nativeElement as HTMLElement;
  function responderCarga(produtos = [CANECA]): void {
    servidor.expectOne((r) => r.url === '/api/produtos').flush({ conteudo: produtos, pagina: 0, tamanho: 100, totalElementos: produtos.length, totalPaginas: 1 });
    servidor.expectOne('/api/categorias').flush([{ id: 1, nome: 'Cestas' }]);
  }

  it('mostra quem está logado e os produtos ativos', () => {
    expect(tela().textContent).toContain('Conectado como maria');
    expect(tela().querySelector('.item .nome')?.textContent).toBe('Caneca');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('excluir: pede confirmação, chama a API e recarrega', async () => {
    vi.spyOn(TestBed.inject(MatDialog), 'open').mockReturnValue({ afterClosed: () => of(true) } as never);

    tela().querySelector<HTMLButtonElement>('button[aria-label="Excluir Caneca"]')!.click();
    servidor.expectOne((r) => r.method === 'DELETE' && r.url === '/api/produtos/1').flush(null, { status: 204, statusText: 'No Content' });
    responderCarga([]);
    await fixture.whenStable();

    expect(tela().textContent).toContain('Nenhum produto ativo.');
  });

  it('"Sair" apaga o token e volta ao login, sem o aviso de sessão expirada', async () => {
    Array.from(tela().querySelectorAll('button')).find((b) => b.textContent?.includes('Sair'))!.click();
    await fixture.whenStable();
    expect(localStorage.getItem('brumi.token')).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/admin/login'], { queryParams: {} });
  });

  it('se o token sumir sozinho (401 numa escrita), volta ao login COM o aviso', async () => {
    TestBed.inject(ArmazenamentoToken).limpar();
    await fixture.whenStable();
    expect(navegar).toHaveBeenCalledWith(['/admin/login'], { queryParams: { expirou: 1 } });
  });
});
