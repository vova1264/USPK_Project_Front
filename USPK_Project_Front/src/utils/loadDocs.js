// loadDocs.js

export const mapDaysToDates = (schedule, startRangeString) => {
    if (!startRangeString) return schedule;

    // Извлекаем дату начала из "26.10.26-31.10.26"
    const match = startRangeString.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})/);
    if (!match) return schedule;

    let [, d, m, y] = match;
    if (y.length === 2) y = `20${y}`;

    const baseDate = new Date(`${y}-${m}-${d}T12:00:00`);
    if (isNaN(baseDate.getTime())) return schedule;

    const dayIndexMap = {
        'MONDAY': 0, 'TUESDAY': 1, 'WEDNESDAY': 2,
        'THURSDAY': 3, 'FRIDAY': 4, 'SATURDAY': 5, 'SUNDAY': 6
    };

    const newSchedule = {};

    Object.entries(schedule).forEach(([key, lessons]) => {
        const dayIndex = dayIndexMap[key];
        if (dayIndex !== undefined) {
            const realDate = new Date(baseDate);
            realDate.setDate(realDate.getDate() + dayIndex);

            const year = realDate.getFullYear();
            const month = String(realDate.getMonth() + 1).padStart(2, '0');
            const date = String(realDate.getDate()).padStart(2, '0');

            newSchedule[`${year}-${month}-${date}`] = lessons;
        } else {
            newSchedule[key] = lessons;
        }
    });

    return newSchedule;
};

export const findDocFiles = async () => {
    const res = await fetch('/docs/docs.json');
    if (!res.ok) throw new Error(`Не удалось загрузить /docs/docs.json (${res.status})`);
    return await res.json();
};

export const parseDocMeta = (name) => {
    const safeName = (name || '').trim();

    const weekMatch = safeName.match(/schedule_(\d{2}\.\d{2}\.\d{2})-(\d{2}\.\d{2}\.\d{2})\.docx$/i);
    if (weekMatch) {
        return {
            mode: 'week',
            range: `${weekMatch[1]}-${weekMatch[2]}`,
            dateString: null,
        };
    }

    const dayMatch = safeName.match(/schedule_(\d{2})\.(\d{2})\.(\d{2})\.docx$/i);
    if (dayMatch) {
        let [, d, m, y] = dayMatch;
        y = `20${y}`;
        return {
            mode: 'date',
            range: null,
            dateString: `${y}-${m}-${d}`,
        };
    }

    return { mode: 'date', range: null, dateString: null };
};

export const normalizeDocUrl = (url, fallbackName) => {
    let u = (url || '').trim();
    if (!u && fallbackName) u = fallbackName;
    if (/^(https?:)?\/\//i.test(u)) return u;
    u = u.replace(/^\.?\//, '');
    if (/^docs\//i.test(u)) return '/' + u;
    return '/docs/' + u;
};