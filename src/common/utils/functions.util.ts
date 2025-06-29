import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as moment from "moment";

@Injectable()
export class FunctionsUtil {

    static generateUnixTimestamp(): number {
        return Math.floor(Date.now());
    }

    static getDate(): string {
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
    static getTime(): string {
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

    static sumArray(numbers: number[]): number {
        return numbers.reduce((acc, curr) => acc + curr, 0);
    }

    static isWithinMinutes(updated_at: number, minutes: number): boolean {
        const currentTimestamp = Date.now();
        const rangeInMilliseconds = minutes * 60000;

        const diff = currentTimestamp - updated_at;
        return diff >= 0 && diff <= rangeInMilliseconds;
    }

    static generateExcelAndUploadToAzure(dataCampaings: any) {
        try {
            // Convertir todos los valores a texto (string)
            const dataAsString = dataCampaings.map((row: any) => {
                const rowAsText = {};
                Object.keys(row).forEach(key => {
                    // Si el valor es un objeto, convertirlo a JSON
                    rowAsText[key] = (typeof row[key] === 'object' && row[key] !== null)
                        ? JSON.stringify(row[key])  // Convertir objeto a texto JSON
                        : String(row[key]);         // Convertir otros tipos a texto
                });
                return rowAsText;
            });

            // Convertir los datos a una hoja de cálculo
            const worksheet = XLSX.utils.json_to_sheet(dataAsString);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Campaigns');

            // Convertir el libro a un buffer
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            const file = {
                originalname: 'campaigns.xlsx',
                buffer: excelBuffer,
            };

            return file;
        } catch (error) {
            console.log(error.message)
            throw new InternalServerErrorException();
        }
    }

    static formatDateAndTimeFromTimestamp(timestamp: number): { date: string; time: string } {
        const dates = new Date(timestamp);

        const date = dates.toLocaleDateString('es-EC', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'America/Guayaquil',
        });

        const time = dates.toLocaleTimeString('es-EC', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // formato 24 horas
            timeZone: 'America/Guayaquil',
        });

        return { date, time };
    }

    static formatUSD(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }

}
