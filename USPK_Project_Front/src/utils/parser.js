import * as cheerio from 'cheerio';
import mammoth from 'mammoth';

// ============================================================
// ✅ Предметы, которые ведёт куратор (подставляется вместо «Не указан»)
// ============================================================
const CURATOR_SUBJECT_PATTERNS = [
    /разговоры\s+о\s+важном/i,
    /классный\s+час/i,
];

const isCuratorSubject = (subject) =>
    CURATOR_SUBJECT_PATTERNS.some((rx) => rx.test(subject || ''));

// ============================================================
// ✅ Паттерны для распознавания заголовков групп
// ============================================================
const GROUP_CODE_PATTERN = /^(ПНК|ДО|КС|ИС|Ю|МР|РУП|СПИЛС|ТД|СКД|КМТИ|З|ДОУ|мп)\s*[-–]?\s*\d+([-–/]\d+)?\s*[а-яё]{0,3}$/i;
const PURE_NUMBER_PATTERN = /^\d{2,4}([-–/]\d+)?\s*[а-яё]{0,3}$/i;

// ============================================================
// ✅ Нормализация имени группы (единый формат для всех файлов)
// ============================================================
const normalizeGroupName = (name) =>
    (name || '').trim().toUpperCase().replace(/\s+/g, ' ');

// Функция для парсинга HTML
export const parseScheduleHtml = (html, dateString) => {
    const $ = cheerio.load(html);
    const groupsData = {};

    $('table').each((tableIndex, table) => {
        const rows = $(table).find('tr');
        let currentGroups = [];

        rows.each((rowIndex, row) => {
            const cells = $(row).find('td, th');

            // 1. Ищем заголовки групп
            const potentialGroupHeaders = [];
            cells.each((cellIndex, cell) => {
                const text = $(cell).text().trim();
                if (!text) return;
                if (text.length > 25) return;

                const isGroupCode = GROUP_CODE_PATTERN.test(text);
                const isNumber = PURE_NUMBER_PATTERN.test(text);

                if (isGroupCode || isNumber) {
                    potentialGroupHeaders.push({ index: cellIndex, name: text });
                }
            });

            if (potentialGroupHeaders.length > 0) {
                currentGroups = potentialGroupHeaders;
                return;
            }

            // 2. Ищем ячейку со временем
            const timeCell = cells.filter((i, el) => $(el).text().includes(':')).first();

            if (timeCell.length > 0 && currentGroups.length > 0) {
                const timeText = timeCell.text().trim();

                // ============================================================
                // 1. ПЫТАЕМСЯ ВЗЯТЬ НОМЕР ПАРЫ ИЗ ЯЧЕЙКИ
                // ============================================================
                let paraNum = null;
                cells.each((i, el) => {
                    if (paraNum) return;
                    const cellText = $(el).text().trim();
                    const match = cellText.match(/^(½\s*)?(\d+)(\s*пара)?$/i);
                    if (match && match[2]) {
                        paraNum = match[1] ? `${match[1].trim()} ${match[2]}` : match[2];
                    }
                });

                // ============================================================
                // 2. ЕСЛИ НОМЕРА НЕТ — ВЫЧИСЛЯЕМ ПО ВРЕМЕНИ
                // ============================================================
                if (!paraNum) {
                    const digitsOnly = timeText.replace(/[^\d:]/g, '');
                    const startTimeMatch = digitsOnly.match(/^(\d{1,2}:\d{2})/);
                    let startTime = startTimeMatch ? startTimeMatch[1] : '';

                    if (startTime && startTime.length === 4) {
                        startTime = '0' + startTime;
                    }

                    const timeToParaMap = {
                        // 1 смена (будни и суббота)
                        '08:00': '1', '09:40': '2', '11:30': '3', '11:50': '3',
                        '13:30': '7', '14:20': '½ 1', '15:05': '½ 2', '16:00': '½ 2',
                        '16:40': '6',
                        // 2 смена
                        '12:35': '½ 3', '13:10': '1', '14:50': '2',
                        '17:50': '3', '19:00': '4',
                        // Старые форматы
                        '08:30': '1', '09:10': '2', '10:45': '3', '11:10': '3', '13:00': '4'
                    };

                    paraNum = timeToParaMap[startTime] || '—';
                }

                // ============================================================
                // 3. Проходим по всем группам в этой строке
                // ============================================================
                currentGroups.forEach(group => {
                    const groupCell = cells.eq(group.index);

                    if (groupCell.length > 0) {
                        const content = groupCell.html();
                        if (content && content.trim().length > 0) {
                            const cleanContent = content
                                .replace(/<br\s*\/?>/gi, '\n')
                                .replace(/<[^>]+>/g, ' ')
                                .replace(/\s+/g, ' ')
                                .trim();

                            if (cleanContent) {
                                // Аудитория
                                const roomMatch = cleanContent.match(/(а\.\d+(?:\.\d+)?|а\/з|спорт\.зал|каб\.[^\s]+)/i);
                                const room = roomMatch ? roomMatch[0] : '';

                                // Преподаватель
                                const teacherMatch = cleanContent.match(/\(([^)]+)\)/);
                                const teacher = teacherMatch ? teacherMatch[1] : '';

                                // Предмет
                                let subject = cleanContent
                                    .replace(room, '')
                                    .replace(`(${teacher})`, '')
                                    .replace(/\(замена\)/gi, '')
                                    .replace(/^[\s.,:;-]+|[\s.,:;-]+$/g, '')
                                    .trim();

                                // Пропускаем разделители
                                if (!subject || /^[-—_\s]+$/.test(subject)) {
                                    return;
                                }

                                // Подпись преподавателя
                                let teacherLabel = teacher;
                                if (!teacherLabel) {
                                    teacherLabel = isCuratorSubject(subject) ? 'Куратор' : 'Не указан';
                                }

                                // ============================================================
                                // ✅ НОРМАЛИЗАЦИЯ ИМЕНИ ГРУППЫ — ЕДИНЫЙ КЛЮЧ ДЛЯ ВСЕХ ФАЙЛОВ
                                // ============================================================
                                const normalizedName = normalizeGroupName(group.name);

                                if (!groupsData[normalizedName]) {
                                    groupsData[normalizedName] = {
                                        id: normalizedName,
                                        name: normalizedName,
                                        schedule: {}
                                    };
                                }
                                if (!groupsData[normalizedName].schedule[dateString]) {
                                    groupsData[normalizedName].schedule[dateString] = [];
                                }

                                // Защита от дубликатов
                                const isDuplicate = groupsData[normalizedName].schedule[dateString].some(
                                    l => l.time === timeText && l.subject === subject
                                );

                                if (!isDuplicate) {
                                    groupsData[normalizedName].schedule[dateString].push({
                                        para: paraNum,
                                        time: timeText,
                                        subject: subject,
                                        teacher: teacherLabel,
                                        room: room || 'Не указана'
                                    });
                                }
                            }
                        }
                    }
                });
            }
        });
    });

    return Object.values(groupsData);
};

// Чтение файла как текста (для .doc с HTML внутри)
const readFileAsText = (blob, encoding) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => resolve('');
        reader.readAsText(blob, encoding);
    });
};

// Основная функция обработки файла
export const processDocFile = async (fileOrBlob, dateString) => {
    try {
        const firstChars = await readFileAsText(fileOrBlob, 'windows-1251');

        if (firstChars && (firstChars.includes('<table') || firstChars.includes('<TABLE') || firstChars.includes('<tr'))) {
            console.log('✅ Обнаружен HTML-формат, парсим как текст');
            return parseScheduleHtml(firstChars, dateString);
        }

        console.log('Используем mammoth для .docx');
        const arrayBuffer = await fileOrBlob.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });

        return parseScheduleHtml(result.value, dateString);

    } catch (error) {
        console.error("❌ Ошибка processDocFile:", error);
        alert(`Ошибка при парсинге: ${error?.message || error}`);
        throw error;
    }
};