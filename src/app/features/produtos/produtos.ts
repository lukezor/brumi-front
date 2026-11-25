import { ViewportScroller } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { catchError, debounceTime, filter, map, of, switchMap, tap } from 'rxjs';
import { CategoriaService } from '../../core/api/categoria.service';
import { ErroApi } from '../../core/api/erro-api';
import { ProdutoService } from '../../core/api/produto.service';
import { Categoria } from '../../core/modelos/categoria';
import { PaginaResponse } from '../../core/modelos/pagina';
import { Produto } from '../../core/modelos/produto';
import { CartaoProduto } from '../../shared/cartao-produto/cartao-produto';
import { providePaginadorEmPortugues } from '../../shared/paginador-pt';
import { DetalheProduto } from './detalhe-produto/detalhe-produto';
import {
  ESPERA_DIGITACAO_MS,
  faixaDePrecoValida,
  FILTRO_INICIAL,
  FiltroFormulario,
  mesmoFiltro,
  OPCOES_ORDEM,
  paraFiltroApi,
  POR_PAGINA,
} from './filtro-catalogo';

/** O que pedir à API: os filtros e a página. */
interface Consulta {
  filtro: FiltroFormulario;
  pagina: number;
}

/** O resultado de uma consulta: deu certo (pagina) ou deu errado (erro). */
type Resposta = { pagina: PaginaResponse<Produto> } | { erro: string };

/**
 * Catálogo: filtros, ordenação, paginação e detalhes. Portado do Products.vue.
 * Diferença principal: o Vue baixava TODOS os produtos e filtrava no navegador. Aqui a API filtra e pagina.
 */
@Component({
  selector: 'app-produtos',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    CartaoProduto,
  ],
  // providers do COMPONENTE: só valem aqui dentro (e nos filhos). O paginador deste catálogo fala português.
  providers: [providePaginadorEmPortugues()],
  templateUrl: './produtos.html',
  styleUrl: './produtos.scss',
})
export class Produtos {
  private readonly produtoService = inject(ProdutoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly dialog = inject(MatDialog);
  private readonly rolagem = inject(ViewportScroller);

  protected readonly opcoesOrdem = OPCOES_ORDEM;
  protected readonly porPagina = POR_PAGINA;

  /**
   * FORMULÁRIO REATIVO: o formulário é um objeto no código (FormGroup), e o template só se liga a ele.
   * Cada campo é um FormControl, com valor inicial e validadores.
   * nonNullable: ao limpar (reset), volta ao valor inicial em vez de virar null.
   * ≈ um ref({ busca: '', ... }) + v-model no Vue; um $scope.filtros + ng-model no AngularJS.
   */
  protected readonly formulario = new FormGroup(
    {
      busca: new FormControl(FILTRO_INICIAL.busca, { nonNullable: true }),
      categorias: new FormControl<number[]>(FILTRO_INICIAL.categorias, { nonNullable: true }),
      precoMin: new FormControl<number | null>(FILTRO_INICIAL.precoMin, [Validators.min(0)]),
      precoMax: new FormControl<number | null>(FILTRO_INICIAL.precoMax, [Validators.min(0)]),
      ordem: new FormControl(FILTRO_INICIAL.ordem, { nonNullable: true }),
    },
    { validators: faixaDePrecoValida },
  );

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly resultado = signal<PaginaResponse<Produto> | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  /** A consulta atual. Mudou (filtro ou página)? A API é chamada de novo. */
  private readonly consulta = signal<Consulta>({ filtro: FILTRO_INICIAL, pagina: 0 });

  /** "Mostrando 1–12 de 30 produtos". */
  protected readonly resumo = computed(() => {
    const r = this.resultado();
    if (!r || r.totalElementos === 0) {
      return '';
    }
    const inicio = r.pagina * r.tamanho + 1;
    const fim = inicio + r.conteudo.length - 1;
    const palavra = r.totalElementos === 1 ? 'produto' : 'produtos';
    return `Mostrando ${inicio}–${fim} de ${r.totalElementos} ${palavra}`;
  });

  constructor() {
    // Categorias para o filtro. Se falhar, o catálogo funciona igual, só sem esse filtro.
    this.categoriaService
      .listar()
      .pipe(takeUntilDestroyed())
      .subscribe({ next: (lista) => this.categorias.set(lista), error: () => this.categorias.set([]) });

    // 1) FORMULÁRIO → CONSULTA. valueChanges é um Observable: emite o formulário inteiro a cada mudança.
    this.formulario.valueChanges
      .pipe(
        debounceTime(ESPERA_DIGITACAO_MS), // espera o usuário parar de mexer por 300 ms
        filter(() => this.formulario.valid), // preço negativo ou faixa invertida: não busca
        map(() => this.formulario.getRawValue()),
        filter((filtro) => !mesmoFiltro(filtro, this.consulta().filtro)), // mudou de verdade?
        takeUntilDestroyed(),
      )
      .subscribe((filtro) => this.consulta.set({ filtro, pagina: 0 })); // filtro novo: volta à 1ª página

    // 2) CONSULTA → API. toObservable transforma o signal num Observable que emite a cada mudança.
    toObservable(this.consulta)
      .pipe(
        tap(() => {
          this.carregando.set(true);
          this.erro.set(null);
        }),
        // switchMap: para cada consulta, uma chamada à API. Se chegar outra consulta antes da resposta,
        // CANCELA a anterior. Sem isso, uma resposta lenta de "ces" poderia chegar DEPOIS da de "cesta" e
        // mostrar o resultado errado.
        switchMap(({ filtro, pagina }) =>
          this.produtoService.listar(paraFiltroApi(filtro, pagina)).pipe(
            map((resultado): Resposta => ({ pagina: resultado })),
            // O catchError fica DENTRO do switchMap: um erro encerra só ESTA chamada. Se ficasse fora,
            // o primeiro erro encerraria o fluxo inteiro e o catálogo pararia de buscar.
            catchError((erro: unknown) =>
              of<Resposta>({ erro: erro instanceof ErroApi ? erro.message : 'Não foi possível carregar os produtos.' }),
            ),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((resposta) => {
        this.carregando.set(false);
        if ('erro' in resposta) {
          this.erro.set(resposta.erro);
        } else {
          this.resultado.set(resposta.pagina);
        }
      });
  }

  protected mudarPagina(evento: PageEvent): void {
    this.consulta.update((atual) => ({ ...atual, pagina: evento.pageIndex }));
    this.rolagem.scrollToPosition([0, 0]);
  }

  protected limparFiltros(): void {
    this.formulario.reset(); // volta aos valores iniciais; o valueChanges cuida do resto
  }

  /** Repete a última consulta. Um objeto NOVO faz o signal avisar que "mudou", mesmo com o mesmo conteúdo. */
  protected tentarNovamente(): void {
    this.consulta.update((atual) => ({ ...atual }));
  }

  protected abrirDetalhes(produto: Produto): void {
    this.dialog.open(DetalheProduto, { data: produto, width: '640px', maxWidth: '95vw' });
  }
}
