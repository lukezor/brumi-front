# Brumi Presentes - Frontend

Site do catálogo de presentes customizados da Brumi, em **Angular 22** com **Angular Material**.
Ele consome a API do repositório `brumi-back`.

- **Site público:** página inicial com vitrine e Instagram, catálogo com busca, filtros, paginação e detalhes.
- **Área administrativa** (`/admin`, com login): produtos, fotos e categorias.

## Pré-requisitos
| Ferramenta | Versão | Como conferir |
|---|---|---|
| Node.js | 22.22+, 24.15+ ou 26+ (LTS) | `node -v` |
| Angular CLI | 22 | `ng version` (instalar: `npm install -g @angular/cli@22`) |
| Backend `brumi-back` rodando | | `http://localhost:8080/api/ping` |

## Como rodar
```powershell
npm install        # na primeira vez (ou quando o package.json mudar)
ng serve           # http://localhost:4200
```
Suba o backend **antes** (`.\mvnw spring-boot:run` no `brumi-back`). Em desenvolvimento, o `ng serve` repassa
as chamadas a `/api` e `/uploads` para `http://localhost:8080` (arquivo `proxy.conf.json`).

O login do admin usa o usuário e a senha definidos no `.env` do backend (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).

## Comandos
| Comando | Faz |
|---|---|
| `ng serve` | Servidor de desenvolvimento, recarrega ao salvar |
| `ng test --watch=false` | Testes (Vitest), uma vez |
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
    ├── app.ts/.html/.scss   layout: barra de topo, menu de celular, conteúdo e rodapé
    ├── app.routes.ts        rotas (/, /produtos, /admin/login, /admin)
    ├── app.config.ts        providers globais (roteador, HTTP, interceptors, idioma)
    ├── core/                sem tela: modelos, services da API, interceptors, autenticação, contato
    ├── shared/              componentes reutilizáveis: cartão e galeria de produto, confirmação, paginador
    └── features/            uma pasta por página: home, produtos, admin (login, formulário, fotos)
```

## Publicação (produção)
1. `ng build` gera os arquivos estáticos em `dist/brumi-web/browser`.
2. O servidor web precisa:
   - servir esses arquivos;
   - devolver o `index.html` para qualquer rota que não seja um arquivo (ex.: `/produtos`), para o roteador do
     Angular funcionar ao recarregar a página;
   - repassar `/api` e `/uploads` para a API (o papel do `proxy.conf.json` em desenvolvimento).
3. Se a API ficar em outro endereço, ajuste `apiUrl` em `src/environments/environment.ts` e inclua a origem do site
   em `CORS_ORIGENS` no backend.

A versão antiga, em Vue, continua na branch `master` até o merge desta migração.
