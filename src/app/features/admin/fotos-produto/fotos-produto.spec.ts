import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FotosProduto } from './fotos-produto';

describe('FotosProduto', () => {
  it('recusa tipo errado e excesso de fotos sem chamar a API; envia o que pode', async () => {
    URL.createObjectURL = () => 'blob:previa'; // o jsdom não tem estas funções do navegador
    URL.revokeObjectURL = () => undefined;
    await TestBed.configureTestingModule({
      imports: [FotosProduto],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // Produto que já tem 4 fotos: cabe só mais 1.
        { provide: MAT_DIALOG_DATA, useValue: { id: 7, nome: 'Cesta', imagens: ['/uploads/1.png', '/uploads/2.png', '/uploads/3.png', '/uploads/4.png'] } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(FotosProduto);
    await fixture.whenStable();
    const tela = fixture.nativeElement as HTMLElement;
    const input = tela.querySelector<HTMLInputElement>('input[type="file"]')!;
    const escolher = async (...arquivos: File[]) => {
      Object.defineProperty(input, 'files', { value: arquivos, configurable: true });
      input.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    };
    const png = (nome: string) => new File(['x'], nome, { type: 'image/png' });

    await escolher(new File(['x'], 'anim.gif', { type: 'image/gif' }));
    expect(tela.querySelector('.erro')?.textContent).toContain('"anim.gif": use PNG, JPEG ou WEBP');

    await escolher(png('a.png'), png('b.png'));
    expect(tela.querySelector('.erro')?.textContent).toContain('Ainda cabem 1');

    await escolher(png('a.png'));
    tela.querySelectorAll<HTMLButtonElement>('mat-dialog-actions button')[1].click(); // "Enviar 1"
    const req = TestBed.inject(HttpTestingController).expectOne('/api/produtos/7/imagens');
    expect((req.request.body as FormData).getAll('imagens').length).toBe(1);
  });
});
