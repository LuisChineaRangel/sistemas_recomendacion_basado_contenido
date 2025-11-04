import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class SistemaRecomendacionService {
    private apiUrl = 'http://localhost:5000/api/resultados';

    constructor(private http: HttpClient) { }

    generarResultados(data: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, data);
    }
}
