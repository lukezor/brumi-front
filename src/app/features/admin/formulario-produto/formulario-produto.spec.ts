import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormularioProduto } from './formulario-produto';

describe('FormularioProduto', () => {
  it('sem nome não envia; com os dados, cria o produto e fecha devolvendo o salvo', async () => {
    const fechar = vi.fn();
    await TestBed.configureTestingModule({
      imports: [FormularioProduto],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: { categorias: [{ id: 1, nome: 'Cestas' }] } },
        // Dublê do diálogo aberto: só precisamos saber se close() foi chamado, e com o quê.
        { provide: MatDialogRef, useValue: { close: fechar } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(FormularioProduto);
    await fixture.whenStable();
    const tela = fixture.nativeElement as HTMLElement;
    const servidor = TestBed.inject(HttpTestingController);
    const preencher = async (nome: string, valor: string) => {
      const campo = tela.querySelector<HTMLInputElement>(`[formcontrolname="${nome}"]`)!;
      campo.value = valor;
      campo.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const salvar = async () => {
      tela.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
      await fixture.whenStable();
    };

    await salvar();
    expect(tela.textContent).toContain('Informe o nome');
    servidor.expectNone('/api/produtos');

    await preencher('nome', '  Caneca  ');
    await preencher('preco', '39.9');
    await salvar();
    const req = servidor.expectOne('/api/produtos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nome: 'Caneca', descricao: null, preco: 39.9, categoriasIds: [] });

    const salvo = { id: 9, nome: 'Caneca', descricao: null, preco: 39.9, ativo: true, categorias: [], imagens: [] };
    req.flush(salvo);
    expect(fechar).toHaveBeenCalledWith(salvo);
  });
});
