import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria } from '../modelos/categoria';

/**
 * Chamadas à API de categorias. (≈ a parte de categorias do products.js antigo.)
 *
 * Cada método devolve um Observable: a requisição só SAI quando alguém faz subscribe() (ou usa
 * toSignal/firstValueFrom). Diferente de uma Promise, que dispara assim que é criada.
 */
@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/categorias`;

  /** GET /api/categorias: todas, ordenadas por nome. */
  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.url);
  }

  /** GET /api/categorias/{id}. */
  obter(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.url}/${id}`);
  }

  /** POST /api/categorias (admin). 409 se o nome já existir. */
  criar(nome: string): Observable<Categoria> {
    return this.http.post<Categoria>(this.url, { nome });
  }
}
