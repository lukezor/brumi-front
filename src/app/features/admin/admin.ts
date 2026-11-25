import { Component, effect, inject, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Painel do administrador (protegido pelo authGuard). Por enquanto: quem está logado e "Sair".
 * O CRUD de produtos, categorias e imagens chega na Task 16.
 */
@Component({
  selector: 'app-admin',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** true quando o próprio usuário clicou em "Sair" (e não quando a sessão expirou). */
  private saindo = false;

  constructor() {
    // Quando a sessão acaba, volta para o login. Isso cobre DOIS casos:
    //  - o usuário clicou em "Sair";
    //  - o token venceu ou foi recusado: numa escrita, a API devolve 401 e o erroInterceptor apaga o token (Task 12).
    // effect: roda de novo sempre que um signal lido dentro dele (aqui, auth.autenticado) muda.
    effect(() => {
      if (!this.auth.autenticado()) {
        untracked(() =>
          this.router.navigate(['/admin/login'], { queryParams: this.saindo ? {} : { expirou: 1 } }),
        );
      }
    });
  }

  protected sair(): void {
    this.saindo = true;
    this.auth.sair();
  }
}
