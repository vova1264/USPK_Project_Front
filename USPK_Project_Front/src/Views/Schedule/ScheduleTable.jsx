const ScheduleTable = ({ schedule, type }) => {
    if (!schedule || Object.keys(schedule).length === 0) {
        return (
            <div className="alert alert-warning border-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Нет данных о расписании.
            </div>
        );
    }

    // Сортируем даты по убыванию — свежие сверху
    const sortedDates = Object.keys(schedule).sort((a, b) => b.localeCompare(a));

    return (
        <div className="mt-2">
            {sortedDates.map(date => {
                const dateObj = new Date(date);
                const options = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
                const dateStr = dateObj.toLocaleDateString('ru-RU', options);
                const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

                // ✅ СОРТИРОВКА ПО ВРЕМЕНИ
                // Извлекаем время начала из строки "08:00-09:30" и сортируем
                const sortedLessons = [...schedule[date]].sort((a, b) => {
                    const timeA = a.time ? a.time.split('-')[0].trim() : '00:00';
                    const timeB = b.time ? b.time.split('-')[0].trim() : '00:00';
                    return timeA.localeCompare(timeB);
                });

                return (
                    <div key={date} className="mb-5 container">
                        <h5 className="text-primary mb-3 border-bottom pb-2">
                            <i className="bi bi-calendar-event me-2"></i>
                            {formattedDate}
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
                                                    : <span className="text-muted">—</span>
                                                }
                                            </td>
                                            <td className="text-nowrap">{lesson.time}</td>
                                            <td>{lesson.subject}</td>
                                            <td>
                                                {type === 'group'
                                                    ? <span className="badge bg-primary-subtle text-primary border border-primary-subtle">{lesson.teacher}</span>
                                                    : <span className="badge bg-success-subtle text-success border border-success-subtle">{lesson.group}</span>
                                                }
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