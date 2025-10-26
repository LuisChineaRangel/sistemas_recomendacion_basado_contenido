import { OnInit, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MaterialFileInputModule } from 'ngx-custom-material-file-input';

const dependencias = [
    RouterOutlet,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MaterialFileInputModule
]

@Component({
    selector: 'app-root',
    imports: [dependencias],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {
    title = 'Sistemas de recomendación | Modelos basados en contenido';

    ngOnInit(): void {
        console.log('Aplicación web iniciada correctamente');
    }
}
