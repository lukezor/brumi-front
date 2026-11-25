import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { CONTATO, linkWhatsapp } from './core/contato';

/** Um item do menu de navegacao. "interface" so existe no TypeScript: descreve o formato de um objeto. */
interface LinkMenu {
  rota: string;
  rotulo: string;
  icone: string;
  /** true = so fica "ativo" na URL exata ("/" nao deve ficar ativo dentro de "/produtos"). */
  exato: boolean;
}

/**
 * Componente RAIZ: o layout que envolve todas as paginas (barra de topo, conteudo e rodape).
 * O <router-outlet /> do template e o lugar onde a pagina da rota atual aparece.
 * ≈ o App.vue com <router-view />, ou o index.html com <ng-view> do AngularJS.
 */
@Component({
  selector: 'app-root',
  // Tudo que o TEMPLATE usa precisa estar aqui. Sem MatToolbarModule, <mat-toolbar> nao funcionaria.
  // ≈ os "import X from './X.vue'" do <script setup>, ou as dependencias do angular.module do AngularJS.
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  // host: liga eventos ao PRÓPRIO elemento do componente (ou à página, com "document:").
  // Esc em qualquer lugar fecha o menu do celular. ≈ um addEventListener('keydown', ...) no document.
  host: { '(document:keydown.escape)': 'fecharMenu()' },
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  /**
   * inject(): pede ao Angular um servico pronto (injecao de dependencia).
   * ≈ o "function($http)" do controller AngularJS, ou o construtor dos services no Spring.
   * BreakpointObserver (do CDK) avisa quando a largura da tela cruza um limite.
   */
  private readonly breakpoints = inject(BreakpointObserver);

  /**
   * Signal que diz se a tela e de celular (menos de 600px).
   * observe() devolve um Observable (um fluxo de valores ao longo do tempo, visto na Task 12);
   * toSignal() o transforma em signal, que o template le com telaPequena().
   * Quando a largura muda, o signal muda e o Angular redesenha so o que depende dele.
   */
  protected readonly telaPequena = toSignal(
    this.breakpoints.observe(Breakpoints.XSmall).pipe(map((resultado) => resultado.matches)),
    { initialValue: false },
  );

  /** readonly: a lista nunca muda, entao nao precisa ser signal. */
  protected readonly links: readonly LinkMenu[] = [
    { rota: '/', rotulo: 'Início', icone: 'home', exato: true },
    { rota: '/produtos', rotulo: 'Produtos', icone: 'storefront', exato: false },
  ];

  protected readonly ano = new Date().getFullYear();
  protected readonly contato = CONTATO;
  protected readonly whatsapp = linkWhatsapp();

  /**
   * Menu do celular aberto? Antes era o mat-menu do Material, que traz junto o "overlay" do CDK (cerca de 83 kB no
   * pacote inicial). Um painel simples faz o mesmo papel com um signal (Task 15, opção B da análise de tamanho).
   */
  protected readonly menuAberto = signal(false);

  constructor() {
    // Escolheu um link (ou navegou de outro jeito)? Fecha o menu. Router.events é um Observable de eventos de
    // navegação. Só nos interessa o fim de uma navegação (NavigationEnd).
    inject(Router)
      .events.pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.fecharMenu());
  }

  protected alternarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
  }

  protected fecharMenu(): void {
    this.menuAberto.set(false);
  }
}
