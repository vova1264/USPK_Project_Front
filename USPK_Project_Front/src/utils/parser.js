import mammoth from 'mammoth';
import { parseDailyHtml } from './parseDaily';
import { parseWeeklyHtml } from './parseWeekly';

// Вспомогательные функции (getWeekDates, readFileAsText) оставляем как были...

const readFileAsText = (blob, encoding) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => resolve('');
        reader.readAsText(blob, encoding);
    });
};

export const processDocFile = async (fileOrBlob, dateString) => {
    try {
        const firstChars = await readFileAsText(fileOrBlob, 'windows-1251');
        if (firstChars && (firstChars.includes('<table') || firstChars.includes('<TABLE') || firstChars.includes('<tr'))) {
            console.log(`✅ Обнаружен HTML-формат, парсим как текст (день)`);
            return parseDailyHtml(firstChars, dateString);
        }

        console.log(`Используем mammoth для .docx (день)`);
        const arrayBuffer = await fileOrBlob.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });

        return parseDailyHtml(result.value, dateString);

    } catch (error) {
        console.error("❌ Ошибка processDocFile:", error);
        alert(`Ошибка при парсинге: ${error?.message || error}`);
        throw error;
    }
};

export const processWeekDocFile = async (fileOrBlob) => {
    try {
        const firstChars = await readFileAsText(fileOrBlob, 'windows-1251');
        if (firstChars && (firstChars.includes('<table') || firstChars.includes('<TABLE') || firstChars.includes('<tr'))) {
            console.log(`✅ Обнаружен HTML-формат, парсим как текст (неделя)`);
            return parseWeeklyHtml(firstChars);
        }

        console.log(`Используем mammoth для .docx (неделя)`);
        const arrayBuffer = await fileOrBlob.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });

        return parseWeeklyHtml(result.value);

    } catch (error) {
        console.error("❌ Ошибка processWeekDocFile:", error);
        alert(`Ошибка при парсинге: ${error?.message || error}`);
        throw error;
    }
};