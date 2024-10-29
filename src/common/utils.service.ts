import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
    getDate(): string {
        const date = new Date();
        const options: Intl.DateTimeFormatOptions = {
            timeZone: 'America/Guayaquil',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };
        const dateString: string = date.toLocaleDateString('es-ES', options);
        return dateString;
    }

    // Método para obtener la hora en Ecuador en formato HH:MM:SS
    getTime(): string {
        const date = new Date();
        const options: Intl.DateTimeFormatOptions = {
            timeZone: 'America/Guayaquil',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Formato de 24 horas
        };
        const timeString: string = date.toLocaleString('es-ES', options);
        return timeString;
    }
}
