import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface DadosConfirmacao {
  titulo: string;
  mensagem: string;
  /** Texto do botão de confirmar (ex.: "Excluir"). */
  confirmar: string;
}

/**
 * Diálogo genérico "tem certeza?". Fecha com true (confirmou) ou com undefined (cancelou, Esc, clique fora).
 * Uso: dialog.open(Confirmacao, { data: {...} }).afterClosed().subscribe((ok) => ...)
 */
@Component({
  selector: 'app-confirmacao',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ dados.titulo }}</h2>
    <mat-dialog-content>{{ dados.mensagem }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" mat-dialog-close>Cancelar</button>
      <!-- [mat-dialog-close]="true": fecha o diálogo devolvendo true para quem abriu. -->
      <button mat-flat-button type="button" class="perigo" [mat-dialog-close]="true">{{ dados.confirmar }}</button>
    </mat-dialog-actions>
  `,
  styles: `
    .perigo {
      --mat-button-filled-container-color: var(--mat-sys-error);
      --mat-button-filled-label-text-color: var(--mat-sys-on-error);
    }
  `,
})
export class Confirmacao {
  protected readonly dados = inject<DadosConfirmacao>(MAT_DIALOG_DATA);
}
