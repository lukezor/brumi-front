import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { urlImagem } from '../../core/api/produto.service';
import { linkWhatsapp } from '../../core/contato';
import { Produto } from '../../core/modelos/produto';

/**
 * Cartão de um produto: foto, nome, descrição, preço e o botão de pedir pelo WhatsApp.
 * Usado na vitrine da Home e, na Task 14, no catálogo. Fica em shared/ porque não pertence a uma página só.
 *
 * Uso: <app-cartao-produto [produto]="p" />
 */
@Component({
  selector: 'app-cartao-produto',
  // CurrencyPipe: o pipe "| currency" do template. ≈ o filtro "| currency" do AngularJS.
  imports: [CurrencyPipe, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './cartao-produto.html',
  styleUrl: './cartao-produto.scss',
})
export class CartaoProduto {
  /**
   * input.required: dado que o componente PAI entrega, e é obrigatório.
   * ≈ defineProps<{ produto: Produto }>() no Vue; scope: { produto: '<' } numa diretiva AngularJS.
   * É um signal: o template lê com produto(), e tudo que depende dele se atualiza se o pai trocar o produto.
   */
  readonly produto = input.required<Produto>();

  /** Mostra o botão "Ver detalhes". Opcional (input() sem required): sem passar, vale false. */
  readonly comDetalhes = input(false);

  /**
   * output(): o FILHO avisa o PAI que algo aconteceu, entregando um valor. O pai escuta com
   * (detalhes)="abrir($event)". ≈ defineEmits + emit('detalhes', produto) no Vue; '&' numa diretiva AngularJS.
   * O cartão não sabe O QUE o pai vai fazer (abrir um diálogo, navegar...). Só avisa.
   */
  readonly detalhes = output<Produto>();

  /** Endereço da primeira foto, ou null se o produto não tiver fotos. */
  protected readonly foto = computed(() => {
    const [primeira] = this.produto().imagens;
    return primeira ? urlImagem(primeira) : null;
  });

  /** Vira true se a foto não carregar (arquivo apagado, sem rede...). Aí mostramos o ícone no lugar. */
  protected readonly fotoFalhou = signal(false);

  protected readonly linkPedido = computed(() =>
    linkWhatsapp(`Olá! Tenho interesse no produto "${this.produto().nome}".`),
  );
}
