import * as cheerio from 'cheerio';

const CURATOR_SUBJECT_PATTERNS = [/разговоры\s+о\s+важном/i, /классный\s+час/i];
const isCuratorSubject = (subject) => CURATOR_SUBJECT_PATTERNS.some((rx) => rx.test(subject || ''));

const GROUP_CODE_PATTERN = /^(ПНК|ДО|КС|ИС|Ю|МР|РУП|СПИЛС|ТД|СКД|КМТИ|З|ДОУ|мп)\s*[-–]?\s*\d+([-–/]\d+)?\s*[а-яё]{0,3}$/i;
const PURE_NUMBER_PATTERN = /^\d{2,4}([-–/]\d+)?\s*[а-яё]{0,3}$/i;

const normalizeGroupName = (name) => (name || '').trim().toUpperCase().replace(/\s+/g, ' ');

export const parseDailyHtml = (html, dateString) => {
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
                const text = $(cell).text().trim().replace(/\*/g, '').replace(/\s+/g, ' ');
                if (!text || text.length > 25) return;

                if (GROUP_CODE_PATTERN.test(text) || PURE_NUMBER_PATTERN.test(text)) {
                    potentialGroupHeaders.push({ index: cellIndex, name: text });
                }
            });

            // Если нашли заголовки — обновляем текущий список групп и идем дальше
            if (potentialGroupHeaders.length > 0) {
                currentGroups = potentialGroupHeaders;
                return;
            }

            // 2. Ищем ячейку со временем
            const timeCell = cells.filter((i, el) => /\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}/.test($(el).text())).first();

            if (timeCell.length > 0 && currentGroups.length > 0) {
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

                // === ГЛАВНАЯ ЗАЩИТА ОТ СЪЕЗДА КОЛОНОК ===
                // Собираем только те ячейки, которые не являются временем и не являются номером пары.
                // Это гарантирует, что мы не захватим лишние ячейки, если mammoth что-то вырезал.
                const dataCells = cells.filter((i, el) => {
                    const t = $(el).text().trim();
                    if (!t) return false;
                    if (/\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}/.test(t)) return false; // время
                    if (/^(½\s*)?\d+(\s*пара)?$/i.test(t)) return false; // номер пары
                    return true;
                });

                // Теперь проходимся по currentGroups.
                // Но чтобы не потерять группы, если у них пустая ячейка, мы должны
                // знать их точный индекс. Самый надежный способ — использовать порядковый номер группы
                // среди "полезных" ячеек (gIdx).
                currentGroups.forEach((group, gIdx) => {
                    // Берем ячейку из dataCells по индексу группы
                    const groupCell = dataCells.eq(gIdx);

                    if (!groupCell || groupCell.length === 0) return;

                    const content = groupCell.html();
                    if (!content || content.trim().length === 0) return;

                    let cleanContent = content
                        .replace(/<br\s*\/?>/gi, '\n')
                        .replace(/<[^>]+>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();

                    // Отсеиваем пустоту и служебные элементы
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
                    if (!groupsData[normalizedName].schedule[dateString]) {
                        groupsData[normalizedName].schedule[dateString] = [];
                    }

                    const isDuplicate = groupsData[normalizedName].schedule[dateString].some(
                        l => l.time === timeText && l.subject === subject
                    );

                    if (!isDuplicate) {
                        groupsData[normalizedName].schedule[dateString].push({
                            para: paraNum,
                            time: timeText,
                            subject: subject,
                            teacher: teacherLabel,
                            room: room || 'Не указана',
                            day: null,
                        });
                    }
                });
            }
        });
    });

    return Object.values(groupsData);
};