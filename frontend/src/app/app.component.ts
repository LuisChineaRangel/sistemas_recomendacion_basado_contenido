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
import { saveAs } from 'file-saver';

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
    idf: number;
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
                duration: 4000,
                panelClass: ['snackbar-error']
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
                        {
                            horizontalPosition: 'start', verticalPosition: 'bottom', duration: 4000,
                            panelClass: ['snackbar-error']
                        }
                    );
                }
            }

            let stopWords, lematizacion;
            try {
                stopWords = await this.leerArchivoComoTexto(ficheroStopWords);
            } catch (error) {
                console.error('Error al leer stopwords:', error);
                this.snackBar.open('Error al leer el archivo de stopwords', 'Cerrar', {
                    horizontalPosition: 'start', verticalPosition: 'bottom', duration: 4000,
                    panelClass: ['snackbar-error']
                });
            }

            try {
                lematizacion = await this.leerArchivoComoTexto(ficheroLematizacion);
            } catch (error) {
                console.error('Error al leer lematización:', error);
                this.snackBar.open('Error al leer el archivo de lematización', 'Cerrar', {
                    horizontalPosition: 'start', verticalPosition: 'bottom', duration: 4000,
                    panelClass: ['snackbar-error']
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
                    this.similaridades = response.similaridades || [];
                    setTimeout(() => { this.asignarPaginadores(); }, 0);
                    this.snackBar.open('Resultados generados correctamente', 'Cerrar', {
                        horizontalPosition: 'start', verticalPosition: 'bottom', duration: 4000,
                        panelClass: ['snackbar-success']
                    });
                },
                error: (error) => {
                    console.error('Error al generar resultados:', error);
                    this.snackBar.open('Error al generar resultados: ' + (error.error?.error || 'Error desconocido'), 'Cerrar', {
                        horizontalPosition: 'start', verticalPosition: 'bottom', duration: 4000,
                        panelClass: ['snackbar-error']
                    });
                },
            });

        } catch (error) {
            console.error('Error inesperado:', error);
            this.snackBar.open('Ocurrió un error inesperado', 'Cerrar', {
                horizontalPosition: 'start', verticalPosition: 'bottom', duration: 4000,
                panelClass: ['snackbar-error']
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

    public exportarResultadosComoTXT(decimales: number = 4) {
        if (this.datos.length === 0) {
            this.snackBar.open('No hay datos para exportar', 'Cerrar', {
                horizontalPosition: 'start',
                verticalPosition: 'bottom',
                duration: 4000,
                panelClass: ['snackbar-info']
            });
            return;
        }

        const tabWidth = 8; // ancho equivalente de un tabulador
        // Función auxiliar para alinear con tabulaciones
        const padWithTabs = (text: string, maxLen: number) => {
            // Calcular el número de "columnas de tab" que ocupa el texto
            const currentTabs = Math.ceil((text.length + 1) / tabWidth);
            const maxTabs = Math.ceil((maxLen + 1) / tabWidth);
            const neededTabs = Math.max(1, maxTabs - currentTabs + 1);
            return text + '\t'.repeat(neededTabs);
        };

        const contenidoTFIDF = this.datos.map(doc => {
            const termsData = doc.terms.data.map((term: any) => ({
                termino: term.termino,
                tf: term.tf.toFixed(decimales),
                idf: term.idf.toFixed(decimales),
                tfidf: term.tfidf.toFixed(decimales)
            }));

            // Calcular el ancho máximo de cada columna
            const maxTermLen = Math.max(...termsData.map(t => t.termino.length), 'Término'.length);
            const maxTfLen = Math.max(...termsData.map(t => t.tf.length), 'TF'.length);
            const maxIdfLen = Math.max(...termsData.map(t => t.idf.length), 'IDF'.length);
            const maxTfidfLen = Math.max(...termsData.map(t => t.tfidf.length), 'TF-IDF'.length);

            // Construir tabla alineada
            const header =
                padWithTabs('Término', maxTermLen) +
                padWithTabs('TF', maxTfLen) +
                padWithTabs('IDF', maxIdfLen) +
                'TF-IDF';

            const terms = termsData.map(t =>
                padWithTabs(t.termino, maxTermLen) +
                padWithTabs(t.tf, maxTfLen) +
                padWithTabs(t.idf, maxIdfLen) +
                t.tfidf
            ).join('\n');

            return (
                `----------------------------\n` +
                `Documento: ${doc.id}\n` +
                `----------------------------\n` +
                `${header}\n${terms}\n`
            );
        }).join('\n');

        let contenidoSimilaridades = '';
        if (this.similaridades && this.similaridades.length > 0) {
            // Preparar datos redondeados
            const simData = this.similaridades.map((s: any) => ({
                documentoA: s.documentoA,
                documentoB: s.documentoB,
                similaridad: s.similaridad.toFixed(decimales)
            }));

            // Determinar ancho máximo por columna
            const maxdocumentoALen = Math.max(...simData.map(s => s.documentoA.length), 'Documento 1'.length);
            const maxdocumentoBLen = Math.max(...simData.map(s => s.documentoB.length), 'Documento 2'.length);
            const maxSimLen = Math.max(...simData.map(s => s.similaridad.length), 'Similaridad'.length);

            // Construcción de encabezado
            const headerSim =
                padWithTabs('Documento 1', maxdocumentoALen) +
                padWithTabs('Documento 2', maxdocumentoBLen) +
                'Similaridad';

            // Construcción de filas
            const filasSim = simData.map(s =>
                padWithTabs(s.documentoA, maxdocumentoALen) +
                padWithTabs(s.documentoB, maxdocumentoBLen) +
                s.similaridad
            ).join('\n');

            contenidoSimilaridades =
                `\n----------------------------------\n` +
                `Similaridad Coseno entre Documentos \n` +
                `------------------------------------\n` +
                `${headerSim}\n${filasSim}\n`;
        }


        const contenidoFinal = `${contenidoTFIDF}${contenidoSimilaridades}`;
        const blob = new Blob([contenidoFinal], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'resultados.txt');
    }

    private asignarPaginadores() {
        if (this.datos.length && this.paginators?.length === this.datos.length)
            this.datos.forEach((doc, index) => {
                doc.terms.paginator = this.paginators?.toArray()[index];
            });
    }
}
