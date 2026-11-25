import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaResponse } from '../modelos/pagina';
import { FiltroProduto, Produto, ProdutoRequest, ProdutoUpdateRequest } from '../modelos/produto';

/** Chamadas à API de produtos e imagens. (≈ o products.js antigo, com axios.) */
@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/produtos`;

  /**
   * GET /api/produtos com filtros e paginação.
   * Só os filtros informados vão na URL. Categorias vão repetidas: ?categorias=1&categorias=3.
   */
  listar(filtro: FiltroProduto = {}): Observable<PaginaResponse<Produto>> {
    return this.http.get<PaginaResponse<Produto>>(this.url, { params: paraParametros(filtro) });
  }

  /** GET /api/produtos/{id} (encontra também inativos). */
  obter(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.url}/${id}`);
  }

  /** POST /api/produtos (admin). Nasce ativo e sem imagens. */
  criar(produto: ProdutoRequest): Observable<Produto> {
    return this.http.post<Produto>(this.url, produto);
  }

  /** PUT /api/produtos/{id} (admin). Só os campos enviados mudam. */
  atualizar(id: number, alteracoes: ProdutoUpdateRequest): Observable<Produto> {
    return this.http.put<Produto>(`${this.url}/${id}`, alteracoes);
  }

  /** DELETE /api/produtos/{id} (admin). A API responde 204 sem corpo: o Observable entrega "void". */
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  /**
   * POST /api/produtos/{id}/imagens (admin), em multipart/form-data, campo "imagens".
   * Não defina o Content-Type à mão: com FormData, o navegador monta o cabeçalho (com o "boundary").
   * (O products.js antigo forçava 'multipart/form-data', o que pode quebrar o envio.)
   */
  adicionarImagens(id: number, arquivos: readonly File[]): Observable<Produto> {
    const formulario = new FormData();
    for (const arquivo of arquivos) {
      formulario.append('imagens', arquivo);
    }
    return this.http.post<Produto>(`${this.url}/${id}/imagens`, formulario);
  }

  /** DELETE /api/produtos/{id}/imagens/{indice} (admin). Devolve o produto atualizado. */
  removerImagem(id: number, indice: number): Observable<Produto> {
    return this.http.delete<Produto>(`${this.url}/${id}/imagens/${indice}`);
  }
}

/**
 * URL completa de uma imagem para usar em <img [src]>.
 * A API devolve "/uploads/<arquivo>" (relativo a ELA). Em desenvolvimento o apiUrl é vazio e o proxy
 * entrega /uploads; em produção, se a API estiver em outro endereço, o apiUrl o coloca na frente.
 * Se a API já devolver uma URL absoluta (url-publica configurada no backend), ela é usada como está.
 */
export function urlImagem(caminho: string): string {
  if (/^https?:\/\//.test(caminho)) {
    return caminho;
  }
  return `${environment.apiUrl}${caminho}`;
}

/** Monta os parâmetros da URL, ignorando o que não foi informado (undefined, null ou texto vazio). */
function paraParametros(filtro: FiltroProduto): HttpParams {
  let params = new HttpParams();
  for (const [chave, valor] of Object.entries(filtro)) {
    if (valor === undefined || valor === null || valor === '') {
      continue;
    }
    if (Array.isArray(valor)) {
      for (const item of valor) {
        params = params.append(chave, String(item));
      }
    } else {
      // HttpParams também é imutável: cada append() devolve um objeto NOVO.
      params = params.set(chave, String(valor));
    }
  }
  return params;
}
