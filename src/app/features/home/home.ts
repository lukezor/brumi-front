import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { ErroApi } from '../../core/api/erro-api';
import { ProdutoService } from '../../core/api/produto.service';
import { CONTATO, linkWhatsapp } from '../../core/contato';
import { Produto } from '../../core/modelos/produto';
import { CartaoProduto } from '../../shared/cartao-produto/cartao-produto';
import { POSTS_INSTAGRAM, TAMANHO_VITRINE } from './conteudo-home';
import { PostInstagram } from './post-instagram/post-instagram';

/**
 * Página inicial: destaque, vitrine com os produtos mais recentes (da API) e posts do Instagram.
 * Portada do Home.vue. Diferenças: a vitrine usa produtos REAIS (o Vue tinha 9 produtos escritos no código,
 * com fotos aleatórias) e o Instagram usa iframes oficiais em vez de v-html + script.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, CartaoProduto, PostInstagram],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly produtoService = inject(ProdutoService);

  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly produtos = signal<Produto[]>([]);

  protected readonly posts = POSTS_INSTAGRAM;
  protected readonly instagram = CONTATO.instagram;
  protected readonly linkPedido = linkWhatsapp('Olá! Gostaria de fazer um pedido.');

  constructor() {
    // sort=id,desc: os cadastrados por último primeiro (os "lançamentos").
    this.produtoService
      .listar({ size: TAMANHO_VITRINE, sort: 'id,desc' })
      // takeUntilDestroyed: se o usuário sair da página antes da resposta, cancela a requisição.
      // Precisa ser chamado no construtor (ou passar o DestroyRef).
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (pagina) => {
          this.produtos.set(pagina.conteudo);
          this.carregando.set(false);
        },
        error: (erro: unknown) => {
          this.erro.set(erro instanceof ErroApi ? erro.message : 'Não foi possível carregar os produtos.');
          this.carregando.set(false);
        },
      });
  }
}
