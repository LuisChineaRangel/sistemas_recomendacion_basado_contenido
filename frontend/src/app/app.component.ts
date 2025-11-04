import { Component, OnInit, inject, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MaterialFileInputModule } from 'ngx-custom-material-file-input';

import { SistemaRecomendacionService } from './services/sistema-recomendacion.service';

const dependencias = [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MaterialFileInputModule,
    ReactiveFormsModule
]

export interface Termino {
    indice: number;
    termino: string;
    tf: number;
    tfidf: number;
}

export interface ResultadoDocumento {
    id: number | string;
    terms: MatTableDataSource<Termino>;
}

export interface SimilaridadCoseno {
    documentoA: string;
    documentoB: string;
    similaridad: number;
}

@Component({
    selector: 'app-root',
    imports: [dependencias],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {
    public title = 'Sistemas de recomendación | Modelos basados en contenido';
    public formRecomendacion: FormGroup;
    public datos: ResultadoDocumento[] = [];
    public similaridades: SimilaridadCoseno[] = [];
    public displayedColumnsResultados: string[] = ['indice', 'termino', 'tf', 'idf', 'tfidf'];
    public displayedColumnsSimilaridad: string[] = ['documentoA', 'documentoB', 'similaridad'];

    private snackBar: MatSnackBar = inject(MatSnackBar);
    @ViewChildren(MatPaginator) paginators!: QueryList<MatPaginator>;

    ngOnInit(): void {
        console.log('Aplicación web iniciada correctamente');
    }

    ngAfterViewInit(): void {
        this.paginators?.changes.subscribe(() => {
            this.asignarPaginadores();
        });
    }

    constructor(private fb: FormBuilder, private sistemaRecomendacionSvc: SistemaRecomendacionService) {
        this.formRecomendacion = this.fb.group({
            documentos: [null, Validators.required],
            ficheroStopWords: [null, Validators.required],
            ficheroLematizacion: [null, Validators.required]
        });
    }

    protected async generarResultados() {
        if (!this.formRecomendacion.valid) {
            console.error('Faltan datos por introducir en el formulario o no son válidos')
            this.snackBar.open('Faltan datos por introducir en el formulario o no son válidos', 'Cerrar', {
                horizontalPosition: 'start',
                verticalPosition: 'bottom',
                duration: 4000
            });
            return;
        }

        this.datos = [];
        this.similaridades = [];
        this.paginators?.forEach(p => p.firstPage());

        const documentos = this.formRecomendacion.get('documentos')?.value?.files;
        const ficheroStopWords = this.formRecomendacion.get('ficheroStopWords')?.value?.files[0];
        const ficheroLematizacion = this.formRecomendacion.get('ficheroLematizacion')?.value?.files[0];
        try {
            const textoDocumentos = [];
            for (const [i, documento] of documentos.entries()) {
                try {
                    textoDocumentos.push({
                        id: documento.name || `archivo #${i}`,
                        contenido: await this.leerArchivoComoTexto(documento)
                    });
                } catch (error) {
                    console.error(`Error al leer "${documento.name || `archivo #${i}`}"`, error);
                    this.snackBar.open(
                        `No se pudo leer "${documento.name || `archivo #${i}`}"`,
                        'Cerrar',
                        { horizontalPosition: 'start', verticalPosition: 'bottom', duration: 4000 }
                    );
                }
            }

            let stopWords, lematizacion;
            try {
                stopWords = await this.leerArchivoComoTexto(ficheroStopWords);
            } catch (error) {
                console.error('Error al leer stopwords:', error);
                this.snackBar.open('Error al leer el archivo de stopwords', 'Cerrar', {
                    horizontalPosition: 'start', verticalPosition: 'bottom', duration: 4000
                });
            }

            try {
                lematizacion = await this.leerArchivoComoTexto(ficheroLematizacion);
            } catch (error) {
                console.error('Error al leer lematización:', error);
                this.snackBar.open('Error al leer el archivo de lematización', 'Cerrar', {
                    horizontalPosition: 'start', verticalPosition: 'bottom', duration: 4000
                });
            }

            this.sistemaRecomendacionSvc.generarResultados({
                documentos: textoDocumentos,
                stopWords: stopWords,
                lematizacion: lematizacion
            }).subscribe({
                next: (response) => {
                    console.log('Resultados generados (raw):', response);
                    this.datos = response.resultados.map((item: { id: string, terms: Termino[] }) => ({
                        id: item.id,
                        terms: new MatTableDataSource<Termino>(item.terms)
                    }));
                    this.similaridades = response.similaridades;
                    setTimeout(() => { this.asignarPaginadores(); }, 0);
                },
                error: (error) => {
                    console.error('Error al generar resultados:', error);
                    this.snackBar.open('Error al generar resultados: ' + (error.error?.error || 'Error desconocido'), 'Cerrar', {
                        horizontalPosition: 'start', verticalPosition: 'bottom', duration: 4000
                    });
                },
            });

        } catch (error) {
            console.error('Error inesperado:', error);
            this.snackBar.open('Ocurrió un error inesperado', 'Cerrar', {
                horizontalPosition: 'start', verticalPosition: 'bottom', duration: 4000
            });
        }
    }

    private leerArchivoComoTexto(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsText(file, 'UTF-8');
        });
    }

    private asignarPaginadores() {
        if (this.datos.length && this.paginators?.length === this.datos.length)
            this.datos.forEach((doc, index) => {
                doc.terms.paginator = this.paginators?.toArray()[index];
            });
    }
}
