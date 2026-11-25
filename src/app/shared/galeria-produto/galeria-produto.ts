import { Component, computed, effect, input, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { urlImagem } from '../../core/api/produto.service';

/**
 * Galeria das fotos de um produto: uma foto por vez, com botões de anterior/próxima e "bolinhas".
 * Portada do ProductImage.vue (que usava o v-carousel do Vuetify).
 *
 * Uso: <app-galeria-produto [imagens]="produto.imagens" [nome]="produto.nome" />
 */
@Component({
  selector: 'app-galeria-produto',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './galeria-produto.html',
  styleUrl: './galeria-produto.scss',
})
export class GaleriaProduto {
  /** Caminhos que a API devolve ("/uploads/..."). */
  readonly imagens = input.required<readonly string[]>();
  /** Nome do produto, para o texto alternativo das fotos. */
  readonly nome = input.required<string>();

  protected readonly enderecos = computed(() => this.imagens().map(urlImagem));
  protected readonly indice = signal(0);
  protected readonly atual = computed(() => this.enderecos()[this.indice()] ?? null);
  /** Posições (0, 1, 2...) das fotos que não carregaram. */
  protected readonly falhas = signal<ReadonlySet<number>>(new Set());

  constructor() {
    // effect(): roda de novo sempre que um signal lido dentro dele muda. Aqui: trocou a lista de fotos
    // (outro produto), volta para a primeira e esquece as falhas. ≈ watch(() => props.product, ...) do Vue.
    // untracked(): mexe nos signais sem que ISSO faça o effect rodar de novo.
    effect(() => {
      this.imagens();
      untracked(() => {
        this.indice.set(0);
        this.falhas.set(new Set());
      });
    });
  }

  /** Avança (+1) ou volta (-1), dando a volta no fim e no começo. */
  protected mover(passo: number): void {
    const total = this.enderecos().length;
    this.indice.update((i) => (i + passo + total) % total);
  }

  protected irPara(posicao: number): void {
    this.indice.set(posicao);
  }

  protected marcarFalha(posicao: number): void {
    this.falhas.update((atuais) => new Set(atuais).add(posicao));
  }
}
