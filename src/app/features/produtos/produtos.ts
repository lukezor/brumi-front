import { Component, inject, signal } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { CategoriaService } from '../../core/api/categoria.service';
import { ErroApi } from '../../core/api/erro-api';
import { ProdutoService } from '../../core/api/produto.service';
import { Categoria } from '../../core/modelos/categoria';

/**
 * Catálogo (provisório). Por enquanto só prova que o front conversa com a API: mostra quantos produtos
 * ativos existem e as categorias. A lista completa com filtros chega na Task 14.
 */
@Component({
  selector: 'app-produtos',
  imports: [MatChipsModule, MatIconModule],
  templateUrl: './produtos.html',
  styleUrl: './produtos.scss',
})
export class Produtos {
  private readonly categoriaService = inject(CategoriaService);
  private readonly produtoService = inject(ProdutoService);

  // Os três estados de uma tela que busca dados: carregando, deu erro, ou os dados.
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly totalProdutos = signal(0);

  constructor() {
    // forkJoin: dispara as duas requisições AO MESMO TEMPO e entrega os dois resultados quando AMBAS terminam.
    // ≈ Promise.all([...]) do JavaScript.
    // size=1: só queremos o total (totalElementos), não a lista.
    forkJoin({
      categorias: this.categoriaService.listar(),
      produtos: this.produtoService.listar({ size: 1 }),
    }).subscribe({
      next: ({ categorias, produtos }) => {
        this.categorias.set(categorias);
        this.totalProdutos.set(produtos.totalElementos);
        this.carregando.set(false);
      },
      error: (erro: unknown) => {
        this.erro.set(erro instanceof ErroApi ? erro.message : 'Erro inesperado.');
        this.carregando.set(false);
      },
    });
    // Não é preciso "desinscrever": uma requisição HTTP entrega UMA resposta e o Observable termina sozinho.
  }
}
