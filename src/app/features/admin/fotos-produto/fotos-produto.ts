import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';
import { ErroApi } from '../../../core/api/erro-api';
import { ProdutoService, urlImagem } from '../../../core/api/produto.service';
import { Produto } from '../../../core/modelos/produto';

/** As mesmas regras do backend (Task 8). Conferir aqui evita enviar algo que a API vai recusar. */
export const MAXIMO_FOTOS = 5;
const TIPOS_ACEITOS = ['image/png', 'image/jpeg', 'image/webp'];
const TAMANHO_MAXIMO = 5 * 1024 * 1024;

interface Selecionado {
  arquivo: File;
  /** Endereço temporário (blob:...) para pré-visualizar a foto antes de enviar. */
  previa: string;
}

/**
 * Diálogo das fotos de um produto: ver, remover e enviar novas (com pré-visualização).
 * Fecha devolvendo o produto atualizado, para o painel recarregar a lista.
 */
@Component({
  selector: 'app-fotos-produto',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './fotos-produto.html',
  styleUrl: './fotos-produto.scss',
})
export class FotosProduto {
  private readonly produtoService = inject(ProdutoService);

  protected readonly produto = signal(inject<Produto>(MAT_DIALOG_DATA));
  protected readonly fotos = computed(() => this.produto().imagens.map(urlImagem));
  protected readonly selecionados = signal<Selecionado[]>([]);
  protected readonly vagas = computed(() => MAXIMO_FOTOS - this.produto().imagens.length - this.selecionados().length);
  protected readonly ocupado = signal(false);
  protected readonly erro = signal<string | null>(null);

  constructor() {
    // URL.createObjectURL reserva memória até ser liberado. Ao fechar o diálogo, libera as prévias que sobraram.
    inject(DestroyRef).onDestroy(() => this.selecionados().forEach((s) => URL.revokeObjectURL(s.previa)));
  }

  /** (change) do <input type="file">. A seleção é conferida aqui, antes de qualquer envio. */
  protected escolher(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const arquivos = Array.from(input.files ?? []);
    input.value = ''; // permite escolher o mesmo arquivo de novo depois
    this.erro.set(null);

    const recusado = arquivos.find((a) => !TIPOS_ACEITOS.includes(a.type) || a.size > TAMANHO_MAXIMO);
    if (recusado) {
      this.erro.set(`"${recusado.name}": use PNG, JPEG ou WEBP de até 5MB.`);
      return;
    }
    if (arquivos.length > this.vagas()) {
      this.erro.set(`Cada produto pode ter no máximo ${MAXIMO_FOTOS} fotos. Ainda cabem ${this.vagas()}.`);
      return;
    }
    this.selecionados.update((atuais) => [...atuais, ...arquivos.map((arquivo) => ({ arquivo, previa: URL.createObjectURL(arquivo) }))]);
  }

  protected desistir(indice: number): void {
    URL.revokeObjectURL(this.selecionados()[indice].previa);
    this.selecionados.update((atuais) => atuais.filter((_, i) => i !== indice));
  }

  protected enviar(): void {
    const arquivos = this.selecionados().map((s) => s.arquivo);
    this.executar(this.produtoService.adicionarImagens(this.produto().id, arquivos), () => {
      this.selecionados().forEach((s) => URL.revokeObjectURL(s.previa));
      this.selecionados.set([]);
    });
  }

  protected remover(indice: number): void {
    this.executar(this.produtoService.removerImagem(this.produto().id, indice));
  }

  /** Envia, atualiza o produto com a resposta da API e trata o erro. */
  private executar(pedido: ReturnType<ProdutoService['removerImagem']>, depois?: () => void): void {
    this.ocupado.set(true);
    this.erro.set(null);
    pedido.pipe(finalize(() => this.ocupado.set(false))).subscribe({
      next: (atualizado) => {
        this.produto.set(atualizado);
        depois?.();
      },
      error: (erro: unknown) => this.erro.set(erro instanceof ErroApi ? erro.message : 'Não foi possível concluir.'),
    });
  }
}
