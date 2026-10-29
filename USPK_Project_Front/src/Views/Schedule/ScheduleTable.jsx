const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const DAY_LABELS = {
    MONDAY: 'Понедельник',
    TUESDAY: 'Вторник',
    WEDNESDAY: 'Среда',
    THURSDAY: 'Четверг',
    FRIDAY: 'Пятница',
    SATURDAY: 'Суббота',
    SUNDAY: 'Воскресенье',
};

const isDayKey = (key) => DAY_ORDER.includes((key || '').toUpperCase());

const formatDateKey = (date) => {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return date; // на всякий случай
    const options = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
    const str = dateObj.toLocaleDateString('ru-RU', options);
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const sortLessons = (lessons) =>
    [...lessons].sort((a, b) => {
        const ta = a.time ? a.time.split('-')[0].trim() : '00:00';
        const tb = b.time ? b.time.split('-')[0].trim() : '00:00';
        return ta.localeCompare(tb);
    });

const ScheduleTable = ({ schedule, type }) => {
    if (!schedule || Object.keys(schedule).length === 0) {
        return (
            <div className="alert alert-warning border-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Нет данных о расписании.
            </div>
        );
    }

    const allKeys = Object.keys(schedule);
    const hasDayKeys = allKeys.some(isDayKey);
    const hasDateKeys = allKeys.some((k) => !isDayKey(k));

    // Порядок вывода:
    // - если есть ключи-дни недели — сначала они в порядке Пн..Вс
    // - затем даты (свежие сверху)
    let orderedKeys;
    if (hasDayKeys && !hasDateKeys) {
        orderedKeys = DAY_ORDER.filter((d) => schedule[d]);
    } else if (hasDayKeys && hasDateKeys) {
        orderedKeys = [
            ...DAY_ORDER.filter((d) => schedule[d]),
            ...allKeys.filter((k) => !isDayKey(k)).sort((a, b) => b.localeCompare(a)),
        ];
    } else {
        orderedKeys = allKeys.sort((a, b) => b.localeCompare(a));
    }

    return (
        <div className="mt-2">
            {orderedKeys.map((key) => {
                const header = isDayKey(key) ? DAY_LABELS[key.toUpperCase()] : formatDateKey(key);
                const sortedLessons = sortLessons(schedule[key] || []);

                return (
                    <div key={key} className="mb-5 container">
                        <h5 className="text-primary mb-3 border-bottom pb-2">
                            <i className="bi bi-calendar-event me-2"></i>
                            {header}
                            {isDayKey(key) && (
                                <span className="badge bg-secondary-subtle text-secondary ms-2 align-middle">
                                    день недели
                                </span>
                            )}
                        </h5>
                        <div className="table-responsive">
                            <table
                                className="table table-bordered table-hover align-middle bg-white schedule-table"
                                style={{ minWidth: '760px' }}
                            >
                                <colgroup>
                                    <col style={{ width: '70px' }} />
                                    <col style={{ width: '130px' }} />
                                    <col style={{ width: '240px' }} />
                                    <col style={{ width: '200px' }} />
                                    <col style={{ width: '120px' }} />
                                </colgroup>
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-center">Пара</th>
                                        <th>Время</th>
                                        <th>Предмет</th>
                                        {type === 'group' ? <th>Преподаватель</th> : <th>Группа</th>}
                                        <th>Аудитория</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedLessons.map((lesson, idx) => (
                                        <tr key={idx}>
                                            <td className="text-center fw-bold">
                                                {lesson.para && lesson.para !== '-'
                                                    ? lesson.para
                                                    : <span className="text-muted">—</span>}
                                            </td>
                                            <td className="text-nowrap">{lesson.time}</td>
                                            <td>{lesson.subject}</td>
                                            <td>
                                                {type === 'group'
                                                    ? <span className="badge bg-primary-subtle text-primary border border-primary-subtle">{lesson.teacher}</span>
                                                    : <span className="badge bg-success-subtle text-success border border-success-subtle">{lesson.group}</span>}
                                            </td>
                                            <td>{lesson.room}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ScheduleTable;