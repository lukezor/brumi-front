import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/** Um post do Instagram: o tipo (foto "p" ou vídeo "reel") e o código que aparece no endereço. */
export interface ReferenciaPost {
  tipo: 'p' | 'reel';
  /** O trecho do endereço: instagram.com/p/<codigo>/ */
  codigo: string;
}

/** Códigos de post do Instagram só têm letras, números, "_" e "-". Qualquer outra coisa é recusada. */
const CODIGO_VALIDO = /^[A-Za-z0-9_-]{5,40}$/;

/** Endereço oficial de "embed" do Instagram para um post. Lança erro se o código for suspeito. */
export function urlDoEmbed(post: ReferenciaPost): string {
  if (!CODIGO_VALIDO.test(post.codigo)) {
    throw new Error(`Código de post do Instagram inválido: "${post.codigo}"`);
  }
  return `https://www.instagram.com/${post.tipo}/${post.codigo}/embed/`;
}

/**
 * Mostra um post do Instagram num <iframe> com o endereço OFICIAL de embed.
 *
 * Por que não fazer como no Vue (v-html com o código do Instagram + o script embed.js)?
 *  - O script do Instagram rodava DENTRO do nosso site, em todas as páginas, com acesso a tudo
 *    (inclusive ao token do admin no localStorage).
 *  - Num <iframe>, a página do Instagram roda isolada, na origem dela. Ela não enxerga o nosso site.
 *  - O sandbox limita ainda mais: o iframe não pode, por exemplo, trocar a página do nosso site.
 */
@Component({
  selector: 'app-post-instagram',
  template: `
    <iframe
      [src]="endereco()"
      title="Post do Instagram da Brumi Presentes"
      loading="lazy"
      referrerpolicy="strict-origin-when-cross-origin"
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
    ></iframe>
  `,
  // Template e estilo podem ficar no próprio arquivo .ts ("inline") quando são pequenos.
  styles: `
    :host {
      display: block;
      width: 100%;
      max-width: 400px;
    }
    iframe {
      display: block;
      width: 100%;
      height: 520px;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 12px;
      background-color: var(--mat-sys-surface);
    }
  `,
})
export class PostInstagram {
  readonly post = input.required<ReferenciaPost>();

  private readonly sanitizer = inject(DomSanitizer);

  /**
   * O Angular BLOQUEIA endereços vindos de variáveis no src de um <iframe> (proteção contra XSS): sem isto,
   * a tela mostraria um erro "unsafe value used in a resource URL context".
   * bypassSecurityTrustResourceUrl diz "eu garanto que este endereço é seguro". Só é seguro aqui porque:
   *   1. o endereço é montado por nós, sempre em https://www.instagram.com/..., e
   *   2. o código do post passou pela validação (só letras, números, "_" e "-").
   * Nunca use bypass com algo que o usuário digitou.
   */
  protected readonly endereco = computed<SafeResourceUrl>(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(urlDoEmbed(this.post())),
  );
}
