import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

/**
 * Teste do LAYOUT. TestBed monta o componente num "navegador de mentira" (jsdom); fixture.nativeElement
 * e o HTML desenhado, que consultamos como faria o JavaScript de uma pagina (querySelector...).
 * ≈ mount() do @vue/test-utils.
 */
describe('App (layout)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      // O template usa routerLink e <router-outlet>, que precisam do roteador.
      providers: [provideRouter([])],
    }).compileComponents();
  });

  async function desenhar(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra a marca com link para o inicio', async () => {
    const tela = await desenhar();
    const marca = tela.querySelector<HTMLAnchorElement>('a.marca');
    expect(marca?.textContent).toContain('BRUMI PRESENTES');
    expect(marca?.getAttribute('href')).toBe('/');
  });

  it('mostra os links de navegacao em tela grande', async () => {
    const tela = await desenhar();
    const links = Array.from(tela.querySelectorAll<HTMLAnchorElement>('nav.navegacao a'));
    expect(links.map((a) => a.textContent?.replace('home', '').replace('storefront', '').trim())).toEqual([
      'Início',
      'Produtos',
    ]);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/', '/produtos']);
  });

  it('tem o lugar onde as paginas aparecem e o rodape com o link do admin', async () => {
    const tela = await desenhar();
    expect(tela.querySelector('main router-outlet')).not.toBeNull();
    const admin = tela.querySelector<HTMLAnchorElement>('footer .final a');
    expect(admin?.textContent).toBe('Área administrativa');
    expect(admin?.getAttribute('href')).toBe('/admin');
    expect(tela.querySelector('footer')?.textContent).toContain(String(new Date().getFullYear()));
  });

  it('o rodape traz o contato da loja em todas as paginas', async () => {
    const tela = await desenhar();
    const rodape = tela.querySelector('footer')!;
    expect(rodape.textContent).toContain('Rio Claro SP');
    expect(rodape.textContent).toContain('(19) 99133-7245');
    const hrefs = Array.from(rodape.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('https://wa.me/5519991337245');
    expect(hrefs).toContain('https://www.instagram.com/brumipresentes/');
    // Links externos abrem em outra aba, com rel="noopener" (a página aberta não controla a nossa).
    const externos = Array.from(rodape.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'));
    expect(externos.every((a) => a.rel.includes('noopener'))).toBe(true);
  });
});
