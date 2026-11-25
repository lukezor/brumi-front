import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { finalize, Observable } from 'rxjs';
import { ErroApi } from '../../../core/api/erro-api';
import { ProdutoService } from '../../../core/api/produto.service';
import { Categoria } from '../../../core/modelos/categoria';
import { Produto } from '../../../core/modelos/produto';

export interface DadosFormularioProduto {
  /** Ausente = criar um produto novo. */
  produto?: Produto;
  categorias: Categoria[];
}

/**
 * Diálogo de criar/editar produto. Fecha devolvendo o produto salvo (ou undefined se cancelar).
 * As regras de validação são as MESMAS do backend (ProdutoRequest): nome obrigatório até 200, descrição até 1000,
 * preço >= 0. Validar nos dois lados é o normal: aqui para avisar rápido, lá para garantir.
 */
@Component({
  selector: 'app-formulario-produto',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
  ],
  templateUrl: './formulario-produto.html',
  styles: `
    .campos { display: flex; flex-direction: column; gap: 4px; min-width: min(480px, 80vw); }
    .erro { color: var(--mat-sys-error); margin: 8px 0 0; }
  `,
})
export class FormularioProduto {
  protected readonly dados = inject<DadosFormularioProduto>(MAT_DIALOG_DATA);
  /** MatDialogRef: controle do diálogo aberto. close(valor) fecha devolvendo o valor. */
  private readonly dialogo = inject(MatDialogRef<FormularioProduto, Produto>);
  private readonly produtoService = inject(ProdutoService);

  protected readonly editando = this.dados.produto !== undefined;
  protected readonly enviando = signal(false);
  protected readonly erro = signal<ErroApi | null>(null);

  protected readonly formulario = new FormGroup({
    nome: new FormControl(this.dados.produto?.nome ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200), Validators.pattern(/\S/)],
    }),
    descricao: new FormControl(this.dados.produto?.descricao ?? '', { nonNullable: true, validators: [Validators.maxLength(1000)] }),
    preco: new FormControl<number | null>(this.dados.produto?.preco ?? null, [Validators.min(0)]),
    categoriasIds: new FormControl<number[]>(this.dados.produto?.categorias.map((c) => c.id) ?? [], { nonNullable: true }),
    ativo: new FormControl(this.dados.produto?.ativo ?? true, { nonNullable: true }),
  });

  protected salvar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valor = this.formulario.getRawValue();
    const dados = { nome: valor.nome.trim(), descricao: valor.descricao || null, preco: valor.preco, categoriasIds: valor.categoriasIds };
    const produto = this.dados.produto;
    const pedido: Observable<Produto> = produto
      ? this.produtoService.atualizar(produto.id, { ...dados, descricao: valor.descricao, preco: valor.preco ?? undefined, ativo: valor.ativo })
      : this.produtoService.criar(dados);

    this.enviando.set(true);
    this.erro.set(null);
    pedido.pipe(finalize(() => this.enviando.set(false))).subscribe({
      next: (salvo) => this.dialogo.close(salvo),
      error: (erro: unknown) => this.erro.set(erro instanceof ErroApi ? erro : new ErroApi(0, 'Não foi possível salvar.')),
    });
  }
}
