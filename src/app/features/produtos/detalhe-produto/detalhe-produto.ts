import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { linkWhatsapp } from '../../../core/contato';
import { Produto } from '../../../core/modelos/produto';
import { GaleriaProduto } from '../../../shared/galeria-produto/galeria-produto';

/**
 * Conteúdo do diálogo "Ver detalhes" (o v-dialog do Products.vue).
 *
 * Quem abre: o catálogo, com dialog.open(DetalheProduto, { data: produto }).
 * Como o produto chega aqui: o componente de um diálogo NÃO recebe input(). Ele pede os dados ao Angular
 * com inject(MAT_DIALOG_DATA), um "token de injeção" que o MatDialog preenche com o "data" do open().
 */
@Component({
  selector: 'app-detalhe-produto',
  imports: [CurrencyPipe, MatDialogModule, MatButtonModule, MatIconModule, MatChipsModule, GaleriaProduto],
  templateUrl: './detalhe-produto.html',
  styleUrl: './detalhe-produto.scss',
})
export class DetalheProduto {
  protected readonly produto = inject<Produto>(MAT_DIALOG_DATA);

  protected readonly linkPedido = linkWhatsapp(`Olá! Tenho interesse no produto "${this.produto.nome}".`);
}
