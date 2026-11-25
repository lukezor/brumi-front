import { TestBed } from '@angular/core/testing';
import { PostInstagram, urlDoEmbed } from './post-instagram';

describe('PostInstagram', () => {
  it('monta o endereço oficial de embed para fotos e reels', () => {
    expect(urlDoEmbed({ tipo: 'p', codigo: 'DKqS6d-PzYy' })).toBe('https://www.instagram.com/p/DKqS6d-PzYy/embed/');
    expect(urlDoEmbed({ tipo: 'reel', codigo: 'DKqZGZyIgKP' })).toBe('https://www.instagram.com/reel/DKqZGZyIgKP/embed/');
  });

  it('recusa códigos que poderiam desviar o endereço', () => {
    for (const codigo of ['../../evil', 'abc/def', 'x?y=1', 'javascript:alert(1)', '', 'abc']) {
      expect(() => urlDoEmbed({ tipo: 'p', codigo })).toThrow('Código de post do Instagram inválido');
    }
  });

  it('desenha um iframe isolado (sandbox) com carregamento sob demanda', async () => {
    await TestBed.configureTestingModule({ imports: [PostInstagram] }).compileComponents();
    const fixture = TestBed.createComponent(PostInstagram);
    fixture.componentRef.setInput('post', { tipo: 'p', codigo: 'DKqS6d-PzYy' });
    await fixture.whenStable();

    const iframe = (fixture.nativeElement as HTMLElement).querySelector('iframe')!;
    expect(iframe.getAttribute('src')).toBe('https://www.instagram.com/p/DKqS6d-PzYy/embed/');
    expect(iframe.getAttribute('loading')).toBe('lazy');
    expect(iframe.getAttribute('sandbox')).toContain('allow-scripts');
    // Sem "allow-top-navigation": o post não consegue trocar a página do nosso site.
    expect(iframe.getAttribute('sandbox')).not.toContain('allow-top-navigation');
    expect(iframe.title).toBe('Post do Instagram da Brumi Presentes');
  });
});
