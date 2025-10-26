import { OnInit, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    title = 'Sistemas de recomendación | Modelos basados en contenido';

    ngOnInit(): void {
        console.log('Aplicación web iniciada correctamente');
    }
}
