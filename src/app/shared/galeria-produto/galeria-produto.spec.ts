import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GaleriaProduto } from './galeria-produto';

describe('GaleriaProduto', () => {
  let fixture: ComponentFixture<GaleriaProduto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GaleriaProduto] }).compileComponents();
    fixture = TestBed.createComponent(GaleriaProduto);
    fixture.componentRef.setInput('nome', 'Cesta');
  });

  async function mostrar(imagens: string[]): Promise<HTMLElement> {
    fixture.componentRef.setInput('imagens', imagens);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const fotoAtual = (tela: HTMLElement) => tela.querySelector<HTMLImageElement>('img.foto')?.getAttribute('src');
  const clicar = async (tela: HTMLElement, seletor: string) => {
    tela.querySelector<HTMLButtonElement>(seletor)!.click();
    await fixture.whenStable();
  };

  it('com várias fotos: começa na primeira e navega com as setas, dando a volta', async () => {
    const tela = await mostrar(['/uploads/a.png', '/uploads/b.png', '/uploads/c.png']);
    expect(fotoAtual(tela)).toBe('/uploads/a.png');
    expect(tela.querySelector('img.foto')?.getAttribute('alt')).toBe('Cesta, foto 1 de 3');

    await clicar(tela, '.proxima');
    expect(fotoAtual(tela)).toBe('/uploads/b.png');
    await clicar(tela, '.anterior');
    await clicar(tela, '.anterior');
    expect(fotoAtual(tela)).toBe('/uploads/c.png'); // antes da primeira, vai para a última
    await clicar(tela, '.proxima');
    expect(fotoAtual(tela)).toBe('/uploads/a.png'); // depois da última, volta à primeira
  });

  it('as bolinhas levam direto a uma foto e marcam a atual', async () => {
    const tela = await mostrar(['/uploads/a.png', '/uploads/b.png', '/uploads/c.png']);
    const bolinhas = () => Array.from(tela.querySelectorAll<HTMLButtonElement>('.bolinhas button'));
    expect(bolinhas().length).toBe(3);

    bolinhas()[2].click();
    await fixture.whenStable();
    expect(fotoAtual(tela)).toBe('/uploads/c.png');
    expect(bolinhas().map((b) => b.getAttribute('aria-current'))).toEqual(['false', 'false', 'true']);
  });

  it('com uma foto: sem setas nem bolinhas', async () => {
    const tela = await mostrar(['/uploads/a.png']);
    expect(fotoAtual(tela)).toBe('/uploads/a.png');
    expect(tela.querySelector('.seta')).toBeNull();
    expect(tela.querySelector('.bolinhas')).toBeNull();
  });

  it('sem fotos: mostra "Sem fotos"', async () => {
    const tela = await mostrar([]);
    expect(tela.querySelector('img')).toBeNull();
    expect(tela.textContent).toContain('Sem fotos');
  });

  it('foto que não carrega vira "Foto indisponível", só naquela posição', async () => {
    const tela = await mostrar(['/uploads/a.png', '/uploads/b.png']);
    tela.querySelector('img.foto')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(tela.textContent).toContain('Foto indisponível');

    await clicar(tela, '.proxima');
    expect(fotoAtual(tela)).toBe('/uploads/b.png');
  });

  it('trocar de produto volta para a primeira foto', async () => {
    const tela = await mostrar(['/uploads/a.png', '/uploads/b.png']);
    await clicar(tela, '.proxima');
    await mostrar(['/uploads/x.png', '/uploads/y.png']);
    expect(fotoAtual(tela)).toBe('/uploads/x.png');
  });
});
