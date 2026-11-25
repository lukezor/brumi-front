import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideLocalizacaoBrasil } from '../../core/localizacao';
import { Produto } from '../../core/modelos/produto';
import { CartaoProduto } from './cartao-produto';

const CESTA: Produto = {
  id: 4,
  nome: 'Cesta Especial',
  descricao: 'Uma seleção especial.',
  preco: 199.9,
  ativo: true,
  categorias: [{ id: 1, nome: 'Cestas' }],
  imagens: ['/uploads/a.png', '/uploads/b.png'],
};

describe('CartaoProduto', () => {
  let fixture: ComponentFixture<CartaoProduto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartaoProduto],
      providers: [provideLocalizacaoBrasil()],
    }).compileComponents();
    fixture = TestBed.createComponent(CartaoProduto);
  });

  /** Entrega o produto como o componente PAI faria com [produto]="...". */
  async function mostrar(produto: Produto): Promise<HTMLElement> {
    fixture.componentRef.setInput('produto', produto);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra nome, descrição, a PRIMEIRA foto e o preço em reais', async () => {
    const tela = await mostrar(CESTA);

    expect(tela.querySelector('.nome')?.textContent).toBe('Cesta Especial');
    expect(tela.querySelector('.descricao')?.textContent).toBe('Uma seleção especial.');
    const foto = tela.querySelector<HTMLImageElement>('img.foto')!;
    expect(foto.getAttribute('src')).toBe('/uploads/a.png');
    expect(foto.alt).toBe('Cesta Especial');
    // O pipe currency em pt-BR usa um espaço "não separável" (\u00a0) entre R$ e o número.
    expect(tela.querySelector('.preco')?.textContent?.trim()).toBe('R$\u00a0199,90');
  });

  it('o botão abre o WhatsApp com a mensagem do produto já escrita', async () => {
    const tela = await mostrar(CESTA);
    const link = tela.querySelector<HTMLAnchorElement>('mat-card-actions a')!;
    expect(link.href).toBe(
      'https://wa.me/5519991337245?text=' + encodeURIComponent('Olá! Tenho interesse no produto "Cesta Especial".'),
    );
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
  });

  it('sem foto, mostra um ícone; sem preço, "Preço sob consulta"; sem descrição, nada', async () => {
    const tela = await mostrar({ ...CESTA, imagens: [], preco: null, descricao: null });

    expect(tela.querySelector('img')).toBeNull();
    expect(tela.querySelector('.sem-foto')?.getAttribute('aria-label')).toBe('Produto sem foto: Cesta Especial');
    expect(tela.querySelector('.preco')?.textContent?.trim()).toBe('Preço sob consulta');
    expect(tela.querySelector('.descricao')).toBeNull();
  });

  it('se a foto não carregar, troca pelo ícone de foto indisponível', async () => {
    const tela = await mostrar(CESTA);
    tela.querySelector('img.foto')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();

    expect(tela.querySelector('img.foto')).toBeNull();
    expect(tela.querySelector('.sem-foto')?.getAttribute('aria-label')).toBe('Foto indisponível: Cesta Especial');
  });

  it('mostra as categorias do produto', async () => {
    const tela = await mostrar(CESTA);
    expect(Array.from(tela.querySelectorAll('mat-chip')).map((c) => c.textContent?.trim())).toEqual(['Cestas']);
  });

  it('sem comDetalhes (como na Home), não há botão "Ver detalhes"', async () => {
    const tela = await mostrar(CESTA);
    expect(tela.textContent).not.toContain('Ver detalhes');
  });

  it('com comDetalhes, o botão "Ver detalhes" emite o produto para o pai (output)', async () => {
    fixture.componentRef.setInput('comDetalhes', true);
    const tela = await mostrar(CESTA);
    const recebidos: unknown[] = [];
    // subscribe no output: é o que o pai faz com (detalhes)="...".
    fixture.componentInstance.detalhes.subscribe((p) => recebidos.push(p));

    Array.from(tela.querySelectorAll('button')).find((b) => b.textContent?.includes('Ver detalhes'))!.click();

    expect(recebidos).toEqual([CESTA]);
  });

  it('preço zero aparece como R$ 0,00 (zero não é "sem preço")', async () => {
    const tela = await mostrar({ ...CESTA, preco: 0 });
    expect(tela.querySelector('.preco')?.textContent?.trim()).toBe('R$\u00a00,00');
  });
});
