import * as cheerio from 'cheerio';

const CURATOR_SUBJECT_PATTERNS = [/разговоры\s+о\s+важном/i, /классный\s+час/i];
const isCuratorSubject = (subject) => CURATOR_SUBJECT_PATTERNS.some((rx) => rx.test(subject || ''));

const GROUP_CODE_PATTERN = /^(ПНК|ДО|КС|ИС|Ю|МР|РУП|СПИЛС|ТД|СКД|КМТИ|З|ДОУ|мп)\s*[-–]?\s*\d+([-–/]\d+)?\s*[а-яё]{0,3}$/i;
const PURE_NUMBER_PATTERN = /^\d{2,4}([-–/]\d+)?\s*[а-яё]{0,3}$/i;

const normalizeGroupName = (name) => (name || '').trim().toUpperCase().replace(/\s+/g, ' ');
const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const detectDayKey = (text) => {
    const clean = (text || '').replace(/\s+/g, ' ').trim().toUpperCase();
    if (!clean) return null;
    if (clean.includes('ПОНЕДЕЛЬНИК')) return 'MONDAY';
    if (clean.includes('ВТОРНИК')) return 'TUESDAY';
    if (clean.includes('СРЕДА')) return 'WEDNESDAY';
    if (clean.includes('ЧЕТВЕРГ')) return 'THURSDAY';
    if (clean.includes('ПЯТНИЦА')) return 'FRIDAY';
    if (clean.includes('СУББОТА')) return 'SATURDAY';
    if (clean.includes('ВОСКРЕСЕНЬЕ')) return 'SUNDAY';
    return null;
};

export const parseWeeklyHtml = (html) => {
    const $ = cheerio.load(html);
    const groupsData = {};

    $('table').each((tableIndex, table) => {
        const rows = $(table).find('tr');
        if (rows.length === 0) return;

        let groupHeaders = [];
        let headerRowIndex = -1;

        // 1. Ищем строку с названиями групп
        rows.each((rowIndex, row) => {
            if (groupHeaders.length > 0) return;
            const cells = $(row).find('td, th');
            const candidates = [];

            cells.each((cellIndex, cell) => {
                const text = $(cell).text().trim().replace(/\*/g, '').replace(/\s+/g, ' ');
                if (text && text.length <= 20) {
                    if (GROUP_CODE_PATTERN.test(text) || PURE_NUMBER_PATTERN.test(text)) {
                        candidates.push({ realIndex: cellIndex, name: text });
                    }
                }
            });

            // Строка считается заголовком, если найдено 2+ группы
            if (candidates.length >= 2) {
                groupHeaders = candidates;
                headerRowIndex = rowIndex;
                return false;
            }
        });

        if (groupHeaders.length === 0) return;

        // 2. Парсим занятия
        let currentDay = null;

        rows.each((rowIndex, row) => {
            // Проверяем дни недели в заголовке (если они там есть)
            if (rowIndex <= headerRowIndex) {
                const dayKey = detectDayKey($(row).text());
                if (dayKey) currentDay = dayKey;
                return;
            }

            const cells = $(row).find('td, th');

            // Проверяем день недели в текущей строке
            const rowText = cells.map((i, el) => $(el).text().trim()).get().filter(Boolean).join(' ');
            const dayKey = detectDayKey(rowText);
            if (dayKey) {
                currentDay = dayKey;
                if (cells.length <= 1) return; // Строка-разделитель
            }

            if (!currentDay) return;

            // Ищем время
            const timeCell = cells.filter((i, el) => /\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}/.test($(el).text())).first();
            if (timeCell.length === 0) return;

            const timeText = timeCell.text().trim();

            // Ищем номер пары
            let paraNum = null;
            cells.each((i, el) => {
                if (paraNum) return;
                const match = $(el).text().trim().match(/^(½\s*)?(\d+)(\s*пара)?$/i);
                if (match && match[2]) paraNum = match[1] ? `${match[1].trim()} ${match[2]}` : match[2];
            });

            if (!paraNum) {
                const startTime = timeText.split('-')[0].trim();
                const timeToParaMap = {
                    '08:00': '1', '08:55': '1', '09:40': '2', '11:05': '2',
                    '11:30': '3', '11:50': '3', '13:30': '7', '14:20': '½ 1',
                    '15:05': '½ 2', '16:00': '½ 2', '16:40': '6', '12:35': '½ 3',
                    '12:45': '5', '13:10': '1', '13:35': '6', '14:50': '2',
                    '17:50': '3', '19:00': '4', '08:30': '1', '09:10': '2'
                };
                paraNum = timeToParaMap[startTime] || '—';
            }

            // === ГЛАВНОЕ ИСПРАВЛЕНИЕ ===
            // Ищем ячейку группы НЕ по индексу, а по её реальному расположению,
            // учитывая, что в HTML могут отсутствовать пустые ячейки (mammoth их вырезает).
            // === НАДЁЖНЫЙ ПОИСК ЯЧЕЙКИ ===
            groupHeaders.forEach((group, gIdx) => {
                // 1. Собираем все "полезные" ячейки (исключаем номер пары, время и день недели)
                const dataCells = cells.filter((i, el) => {
                    const t = $(el).text().trim();
                    if (!t) return false;
                    if (/^\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}$/.test(t)) return false; // время
                    if (/^(½\s*)?\d+(\s*пара)?$/i.test(t)) return false; // номер пары
                    if (detectDayKey(t)) return false; // день недели
                    return true;
                });

                // 2. Берем ячейку по порядку (gIdx — порядковый номер группы в заголовке)
                const targetCell = dataCells.eq(gIdx);

                if (!targetCell || targetCell.length === 0) return;

                const content = targetCell.html();
                if (!content || content.trim().length === 0) return;

                let cleanContent = content
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                // Отсеиваем мусор
                if (!cleanContent || /^[-—_\s]+$/.test(cleanContent)) return;
                if (/^(½\s*)?\d+(\s*пара)?$/i.test(cleanContent)) return;
                if (/^\d{1,2}:\d{2}/.test(cleanContent)) return;
                if (/^(ПОНЕДЕЛЬНИК|ВТОРНИК|СРЕДА|ЧЕТВЕРГ|ПЯТНИЦА|СУББОТА|ВОСКРЕСЕНЬЕ)$/i.test(cleanContent)) return;
                const roomMatch = cleanContent.match(/(а\.\d+(?:\.\d+)?|а\/з|спорт\.зал|каб\.[^\s]+)/i);
                const room = roomMatch ? roomMatch[0] : '';

                const teacherMatch = cleanContent.match(/\(([^)]+)\)/);
                const teacher = teacherMatch ? teacherMatch[1] : '';

                let subject = cleanContent
                    .replace(room, '')
                    .replace(`(${teacher})`, '')
                    .replace(/\(замена\)/gi, '')
                    .replace(/^[\s.,:;-]+|[\s.,:;-]+$/g, '')
                    .trim();

                if (!subject) return;

                let teacherLabel = teacher;
                if (!teacherLabel) teacherLabel = isCuratorSubject(subject) ? 'Куратор' : 'Не указан';

                const normalizedName = normalizeGroupName(group.name);

                if (!groupsData[normalizedName]) {
                    groupsData[normalizedName] = { id: normalizedName, name: normalizedName, schedule: {} };
                }
                if (!groupsData[normalizedName].schedule[currentDay]) {
                    groupsData[normalizedName].schedule[currentDay] = [];
                }

                const isDuplicate = groupsData[normalizedName].schedule[currentDay].some(
                    l => l.time === timeText && l.subject === subject
                );

                if (!isDuplicate) {
                    groupsData[normalizedName].schedule[currentDay].push({
                        para: paraNum,
                        time: timeText,
                        subject,
                        teacher: teacherLabel,
                        room: room || 'Не указана',
                        day: currentDay,
                    });
                }
            });
        });
    });

    // Сортировка
    Object.values(groupsData).forEach(group => {
        const sorted = {};
        DAY_ORDER.forEach(day => {
            if (group.schedule[day]) {
                group.schedule[day].sort((a, b) => a.time.localeCompare(b.time));
                sorted[day] = group.schedule[day];
            }
        });
        group.schedule = sorted;
    });

    return Object.values(groupsData);
};