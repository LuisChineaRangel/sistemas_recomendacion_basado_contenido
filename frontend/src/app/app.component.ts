import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
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
    MatFormFieldModule,
    MaterialFileInputModule,
    ReactiveFormsModule
]

@Component({
    selector: 'app-root',
    imports: [dependencias],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {
    public title = 'Sistemas de recomendación | Modelos basados en contenido';
    public formRecomendacion: FormGroup;
    public datos: any[] = [];
    private snackBar: MatSnackBar = inject(MatSnackBar);

    ngOnInit(): void {
        console.log('Aplicación web iniciada correctamente');
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

        const documentos = this.formRecomendacion.get('documentos')?.value?.files;
        const ficheroStopWords = this.formRecomendacion.get('ficheroStopWords')?.value?.files[0];
        const ficheroLematizacion = this.formRecomendacion.get('ficheroLematizacion')?.value?.files[0];
        try {
            const textoDocumentos = [];
            for (const [i, documento] of documentos.entries()) {
                try {
                    textoDocumentos.push(await this.leerArchivoComoTexto(documento));
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
                    console.log('Resultados generados:', response);
                    this.datos = response.resultados;
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
}
