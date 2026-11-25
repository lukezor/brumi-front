# Brumi Presentes - Frontend

Site do catálogo de presentes customizados da Brumi, em **Angular 22** com **Angular Material**.
Ele consome a API do repositório `brumi-back`.

> Em construção: migração do Vue para Angular. A versão antiga está em `_legacy/` (será removida no fim).

## Pré-requisitos
| Ferramenta | Versão | Como conferir |
|---|---|---|
| Node.js | 22.22+, 24.15+ ou 26+ (LTS) | `node -v` |
| Angular CLI | 22 | `ng version` (instalar: `npm install -g @angular/cli@22`) |
| Backend `brumi-back` rodando | | `http://localhost:8080/api/ping` |

## Como rodar
```powershell
npm install        # só na primeira vez (ou quando o package.json mudar)
ng serve           # http://localhost:4200
```
Suba o backend **antes** (`.\mvnw spring-boot:run` no `brumi-back`). Em desenvolvimento, o `ng serve` repassa
as chamadas a `/api` e `/uploads` para `http://localhost:8080` (arquivo `proxy.conf.json`).

## Comandos
| Comando | Faz |
|---|---|
| `ng serve` | Servidor de desenvolvimento, recarrega ao salvar |
| `ng test` | Testes (Vitest). `ng test --watch=false` roda uma vez e sai |
| `ng build` | Build de produção em `dist/brumi-web/browser` |
| `ng generate component features/nome` | Cria um componente novo |

## Estrutura
```
src/
├── index.html            página única (SPA)
├── main.ts               inicia a aplicação
├── styles.scss           estilos globais e tema do Angular Material
├── environments/         configuração por ambiente (endereço da API)
└── app/
    ├── app.ts/.html/.scss   layout: barra de topo, conteúdo e rodapé
    ├── app.routes.ts        rotas (/, /produtos, /admin)
    ├── app.config.ts        providers globais
    └── features/            uma pasta por página
```
