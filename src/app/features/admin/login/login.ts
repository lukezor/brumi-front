import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ErroApi } from '../../../core/api/erro-api';
import { AuthService } from '../../../core/auth/auth.service';

/**
 * Só aceita voltar para uma página DO ADMIN deste site. Sem isto, um link malicioso como
 * /admin/login?retorno=https://site-falso.com levaria a pessoa para fora do site logo após o login, e ela
 * confiaria no site falso ("open redirect").
 */
export function retornoSeguro(retorno: string | null): string {
  return retorno && /^\/admin(\/|\?|$)/.test(retorno) && !retorno.startsWith('//') ? retorno : '/admin';
}

/** Tela de login do administrador. Portada do formulário de login do Admin.vue. */
@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * ActivatedRoute: informações da rota ATUAL. snapshot.queryParamMap lê o "?retorno=...&expirou=1" da URL.
   * ≈ useRoute().query do Vue; $routeParams / $location.search() do AngularJS.
   */
  private readonly parametros = inject(ActivatedRoute).snapshot.queryParamMap;
  private readonly retorno = retornoSeguro(this.parametros.get('retorno'));

  /** Veio de um 401 (token vencido)? Mostra o aviso. */
  protected readonly sessaoExpirou = this.parametros.has('expirou');

  protected readonly formulario = new FormGroup({
    usuario: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    senha: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly mostrarSenha = signal(false);
  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected entrar(): void {
    if (this.formulario.invalid) {
      // Mostra os erros dos campos vazios (normalmente só aparecem depois que o campo é "tocado").
      this.formulario.markAllAsTouched();
      return;
    }
    if (this.enviando()) {
      return; // dois cliques rápidos não fazem dois logins
    }
    this.enviando.set(true);
    this.erro.set(null);

    const { usuario, senha } = this.formulario.getRawValue();
    this.auth
      .login({ username: usuario.trim(), password: senha })
      .pipe(
        // finalize: roda no fim, dando certo ou errado. ≈ o "finally" de um try/catch.
        finalize(() => this.enviando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.router.navigateByUrl(this.retorno),
        error: (erro: unknown) => {
          this.erro.set(erro instanceof ErroApi ? erro.message : 'Não foi possível entrar. Tente novamente.');
          // Por segurança, a senha errada é apagada; o usuário continua preenchido.
          this.formulario.controls.senha.reset();
        },
      });
  }
}
