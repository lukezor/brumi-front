import { CurrencyPipe } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { filter, forkJoin, switchMap } from 'rxjs';
import { CategoriaService } from '../../core/api/categoria.service';
import { ErroApi } from '../../core/api/erro-api';
import { ProdutoService, urlImagem } from '../../core/api/produto.service';
import { AuthService } from '../../core/auth/auth.service';
import { Categoria } from '../../core/modelos/categoria';
import { Produto } from '../../core/modelos/produto';
import { Confirmacao, DadosConfirmacao } from '../../shared/confirmacao/confirmacao';
import { FormularioProduto } from './formulario-produto/formulario-produto';
import { FotosProduto } from './fotos-produto/fotos-produto';

/** Painel do administrador (protegido pelo authGuard): produtos, fotos e categorias. Portado do Admin.vue. */
@Component({
  selector: 'app-admin',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    MatTabsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly produtoService = inject(ProdutoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly dialog = inject(MatDialog);
  /** MatSnackBar: aviso rápido no rodapé da tela ("Produto salvo"). */
  private readonly aviso = inject(MatSnackBar);

  protected readonly urlImagem = urlImagem;
  protected readonly ativos = signal(true);
  protected readonly produtos = signal<Produto[]>([]);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly novaCategoria = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] });

  /** true quando o próprio usuário clicou em "Sair" (e não quando a sessão expirou). */
  private saindo = false;

  constructor() {
    // Sessão acabou ("Sair", ou 401 numa escrita que fez o erroInterceptor apagar o token): volta ao login (Task 15).
    effect(() => {
      if (!this.auth.autenticado()) {
        untracked(() => this.router.navigate(['/admin/login'], { queryParams: this.saindo ? {} : { expirou: 1 } }));
      }
    });
    this.carregar();
  }

  /** Busca produtos (do grupo escolhido) e categorias. size=100 é o máximo da API: sem paginação no painel. */
  protected carregar(): void {
    this.carregando.set(true);
    forkJoin({
      produtos: this.produtoService.listar({ ativo: this.ativos(), size: 100, sort: 'nome,asc' }),
      categorias: this.categoriaService.listar(),
    }).subscribe({
      next: ({ produtos, categorias }) => {
        this.produtos.set(produtos.conteudo);
        this.categorias.set(categorias);
        this.erro.set(null);
        this.carregando.set(false);
      },
      error: (erro: unknown) => {
        this.erro.set(mensagem(erro));
        this.carregando.set(false);
      },
    });
  }

  protected trocarGrupo(ativos: boolean): void {
    this.ativos.set(ativos);
    this.carregar();
  }

  protected nomesDasCategorias(produto: Produto): string {
    return produto.categorias.map((c) => c.nome).join(', ');
  }

  /** Sem produto = novo. afterClosed(): Observable que entrega o que o diálogo devolveu ao fechar. */
  protected abrirFormulario(produto?: Produto): void {
    this.dialog
      .open(FormularioProduto, { data: { produto, categorias: this.categorias() }, maxWidth: '95vw' })
      .afterClosed()
      .pipe(filter((salvo): salvo is Produto => !!salvo)) // cancelou: não faz nada
      .subscribe((salvo) => {
        this.avisar(produto ? `"${salvo.nome}" atualizado.` : `"${salvo.nome}" criado. Agora você pode adicionar fotos.`);
        this.carregar();
      });
  }

  protected abrirFotos(produto: Produto): void {
    this.dialog.open(FotosProduto, { data: produto, maxWidth: '95vw' }).afterClosed().subscribe(() => this.carregar());
  }

  protected excluir(produto: Produto): void {
    const dados: DadosConfirmacao = {
      titulo: 'Excluir produto',
      mensagem: `Excluir "${produto.nome}" e as fotos dele? Não dá para desfazer. Para só esconder do catálogo, edite e desative.`,
      confirmar: 'Excluir',
    };
    this.dialog
      .open(Confirmacao, { data: dados })
      .afterClosed()
      .pipe(
        filter((confirmou) => confirmou === true),
        // switchMap: quando confirmar, troca o fluxo "diálogo fechou" pelo fluxo "exclusão na API".
        switchMap(() => this.produtoService.excluir(produto.id)),
      )
      .subscribe(this.observadorDeAcao(`"${produto.nome}" excluído.`));
  }

  protected criarCategoria(): void {
    if (this.novaCategoria.invalid) {
      return;
    }
    this.categoriaService.criar(this.novaCategoria.value.trim()).subscribe(
      this.observadorDeAcao('Categoria adicionada.', () => this.novaCategoria.reset()),
    );
  }

  protected sair(): void {
    this.saindo = true;
    this.auth.sair();
  }

  /** O mesmo tratamento para toda ação: deu certo → aviso + recarrega; deu errado → aviso com a mensagem da API. */
  private observadorDeAcao(sucesso: string, depois?: () => void): { next: () => void; error: (erro: unknown) => void } {
    return {
      next: () => {
        this.avisar(sucesso);
        depois?.();
        this.carregar();
      },
      error: (erro: unknown) => this.avisar(mensagem(erro)),
    };
  }

  private avisar(texto: string): void {
    this.aviso.open(texto, 'OK', { duration: 4000 });
  }
}

function mensagem(erro: unknown): string {
  return erro instanceof ErroApi ? erro.message : 'Não foi possível concluir a operação.';
}
