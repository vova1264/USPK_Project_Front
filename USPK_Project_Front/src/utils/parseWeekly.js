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

        // 1. Ищем заголовки групп и их логические индексы
        rows.each((rowIndex, row) => {
            if (groupHeaders.length > 0) return;
            const cells = $(row).find('td, th');
            const candidates = [];
            let logicalIndex = 0;

            cells.each((cellIndex, cell) => {
                const colspan = parseInt($(cell).attr('colspan') || 1, 10);
                const text = $(cell).text().trim().replace(/\*/g, '').replace(/\s+/g, ' ');

                if (text && text.length <= 25) {
                    if (GROUP_CODE_PATTERN.test(text) || PURE_NUMBER_PATTERN.test(text)) {
                        candidates.push({ colIndex: logicalIndex, name: text });
                    }
                }
                logicalIndex += colspan;
            });

            if (candidates.length > 0) {
                groupHeaders = candidates;
                headerRowIndex = rowIndex;
                return false;
            }
        });

        if (groupHeaders.length === 0) return;

        let currentDay = null;

        rows.each((rowIndex, row) => {
            if (rowIndex <= headerRowIndex) {
                const dayKey = detectDayKey($(row).text());
                if (dayKey) currentDay = dayKey;
                return;
            }

            const cells = $(row).find('td, th');
            const rowText = cells.map((i, el) => $(el).text().trim()).get().filter(Boolean).join(' ');
            const dayKey = detectDayKey(rowText);
            if (dayKey) {
                currentDay = dayKey;
                if (cells.length <= 1) return;
            }

            if (!currentDay) return;

            // 2. Строим жесткую сетку ячеек
            const cellsGrid = [];
            let currentLogicalIndex = 0;

            cells.each((i, el) => {
                const colspan = parseInt($(el).attr('colspan') || 1, 10);
                const text = $(el).text().trim();
                const html = $(el).html();

                for (let c = 0; c < colspan; c++) {
                    cellsGrid[currentLogicalIndex + c] = { text, html };
                }
                currentLogicalIndex += colspan;
            });

            // 3. Проходимся по группам
            groupHeaders.forEach((group) => {
                const paraCell = cellsGrid[group.colIndex];
                const timeCell = cellsGrid[group.colIndex + 1];
                const subjectCell = cellsGrid[group.colIndex + 2];

                // Если времени нет — это либо пустая строка, либо не относится к паре
                if (!timeCell || !timeCell.text) return;

                const timeText = timeCell.text;
                if (!/\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}/.test(timeText)) return;

                // Если времени есть, но нет предмета (из-за rowspan) — пропускаем, чтобы не дублировать
                if (!subjectCell || !subjectCell.text || /^[-—_\s]+$/.test(subjectCell.text)) return;

                // Парсим номер пары
                let paraNum = '—';
                if (paraCell && paraCell.text) {
                    const match = paraCell.text.match(/^(½\s*)?([1-8])(\s*пара)?$/i);
                    if (match) {
                        paraNum = match[1] ? `${match[1].trim()} ${match[2]}` : match[2];
                    } else {
                        paraNum = paraCell.text.trim(); // Берем как есть (например, "7" или "1 пара")
                    }
                }

                if (paraNum === '—') {
                    const startTime = timeText.split('-')[0].replace(/[–—]/g, '-').trim();
                    const timeToParaMap = {
                        '08:00': '1', '08:55': '1', '09:40': '2', '11:05': '2',
                        '11:30': '3', '11:50': '3', '13:30': '7', '14:20': '½ 1',
                        '15:05': '½ 2', '16:00': '½ 2', '16:40': '6', '12:35': '½ 3',
                        '12:45': '5', '13:10': '1', '13:35': '6', '14:50': '2',
                        '17:50': '3', '19:00': '4', '08:30': '1', '09:10': '2'
                    };
                    paraNum = timeToParaMap[startTime] || '—';
                }

                // Парсим предмет
                let cleanContent = (subjectCell.html || '')
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                // Если после очистки осталась только цифра или номер пары, пропускаем
                if (/^(½\s*)?([1-8])(\s*пара)?$/i.test(cleanContent)) return;

                const roomMatch = cleanContent.match(/(?:\b|\s)(а\.\d+(?:\.\d+)?|а\/з|спорт\.зал|каб\.[^\s]+)(?:\b|\s|$)/i);
                let room = roomMatch ? roomMatch[1] : '';

                if (room && room.length <= 3 && !isNaN(room.replace('а.', ''))) {
                    const index = cleanContent.indexOf(room);
                    if (index > 0 && cleanContent[index - 1].match(/[А-ЯЁA-Z]/i)) {
                        room = '';
                    }
                }

                const teacherMatch = cleanContent.match(/\(([^)]+)\)/);
                const teacher = teacherMatch ? teacherMatch[1] : '';

                let subject = cleanContent
                    .replace(room, '')
                    .replace(`(${teacher})`, '')
                    .replace(/\(замена\)/gi, '')
                    .replace(/^[\s.,:;-]+|[\s.,:;-]+$/g, '')
                    .trim();

                if (!teacher && subject.includes('(')) {
                    subject = subject.split('(')[0].trim();
                }

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

    // Сортировка по времени
    Object.values(groupsData).forEach(group => {
        const sorted = {};
        DAY_ORDER.forEach(day => {
            if (group.schedule[day]) {
                group.schedule[day].sort((a, b) => {
                    const timeA = a.time.split('-')[0].trim();
                    const timeB = b.time.split('-')[0].trim();
                    return timeA.localeCompare(timeB);
                });
                sorted[day] = group.schedule[day];
            }
        });
        group.schedule = sorted;
    });

    return Object.values(groupsData);
};