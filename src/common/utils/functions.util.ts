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

    static getWeekRange(weeksAgo = 0) {
        const startOfWeek = moment().subtract(weeksAgo, "weeks").startOf("isoWeek");
        const endOfWeek = moment().subtract(weeksAgo, "weeks").endOf("isoWeek");

        return {
            start: startOfWeek.valueOf(),
            end: endOfWeek.valueOf()
        };
    }

    static getCurrentMonthRange() {
        const startOfMonth = moment().startOf("month");
        const endOfMonth = moment().endOf("month");

        return {
            start: startOfMonth.valueOf(),
            end: endOfMonth.valueOf()
        };
    }

    static getDaysOfCurrentMonthAsStrings(): string[] {
        const daysInMonth = moment().daysInMonth();
        const daysArray: string[] = [];
        for (let day = 1; day <= daysInMonth; day++) {
            daysArray.push(day.toString());
        }
        return daysArray;
    }

    static sumArray(numbers: number[]): number {
        return numbers.reduce((acc, curr) => acc + curr, 0);
    }

    static summarizeMessagesByDay(startDate: number, endDate: number, result: { timestamp: string }[]) {
        const start = moment(startDate);
        const end = moment(endDate);

        // Inicializa un arreglo con 0s, uno por cada día en el rango
        const dailyCount: { date: number, count: number }[] = [];

        // Itera sobre cada día en el rango de fechas
        for (let day = moment(start); day.isSameOrBefore(end); day.add(1, 'days')) {
            dailyCount.push({ date: day.valueOf(), count: 0 }); // Inicializa el contador para cada día
        }

        // Recorre los resultados y cuenta las ocurrencias de send_at por día
        result.forEach(record => {
            const sendDate = moment(record.timestamp);
            const dayIndex = sendDate.diff(start, 'days'); // Encuentra el índice del día correspondiente
            if (dayIndex >= 0 && dayIndex < dailyCount.length) {
                dailyCount[dayIndex].count += 1;
            }
        });

        return dailyCount.map((d: any) => d.count); // Devuelve el arreglo con los conteos por día
    }

    static isWithinMinutes(updated_at: number, minutes: number): boolean {
        const currentTimestamp = Date.now();
        const rangeInMilliseconds = minutes * 60000;

        const diff = currentTimestamp - updated_at;
        return diff >= 0 && diff <= rangeInMilliseconds;
    }

    static getRandomCode(): number {
        const min = 100000; // Mínimo valor de 6 dígitos (no empieza con 0)
        const max = 999999; // Máximo valor de 6 dígitos
        return Math.floor(Math.random() * (max - min + 1) + min);
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

    static renderTemplate(html, variables) {
        return html.replace(/{{\s*(\w+)\s*}}/g, (_: any, key: any) => {
            return variables.hasOwnProperty(key) ? variables[key] : '';
        });
    }

}
