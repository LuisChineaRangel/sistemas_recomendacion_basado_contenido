import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class SistemaRecomendacionService {
    private apiUrl = `${environment.apiUrl}/resultados`;

    constructor(private http: HttpClient) { }

    generarResultados(data: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, data);
    }
}
