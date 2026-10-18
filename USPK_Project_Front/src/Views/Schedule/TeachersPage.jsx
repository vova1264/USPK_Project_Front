import { useState } from 'react';
import ScheduleTable from './ScheduleTable';

const TeachersPage = ({ data }) => {
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [search, setSearch] = useState('');

    if (!data || !data.teachers || data.teachers.length === 0) {
        return (
            <div className="alert alert-info border-0 shadow-sm">
                <i className="bi bi-info-circle me-2"></i>
                Загрузите файлы расписания, чтобы увидеть данные.
            </div>
        );
    }

    // Фильтруем по подстроке (регистронезависимо)
    const filteredTeachers = data.teachers.filter((t) =>
        t.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    // Группируем уже отфильтрованный список
    const groupedByLetter = filteredTeachers.reduce((acc, teacher) => {
        const letter = teacher.name[0].toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(teacher);
        return acc;
    }, {});

    if (selectedTeacher) {
        return (
            <div className="card shadow-sm border-0 container">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">
                        Расписание преподавателя: <span className="text-primary">{selectedTeacher.name}</span>
                    </h4>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setSelectedTeacher(null)}
                    >
                        <i className="bi bi-arrow-left me-1"></i> Назад к списку преподавателей
                    </button>
                </div>
                <div className="card-body">
                    <ScheduleTable schedule={selectedTeacher.schedule} type="teacher" />
                </div>
            </div>
        );
    }

    return (
        <div className="card shadow-sm border-0 container">
            <div className="card-header bg-white py-3 d-flex flex-wrap gap-3 justify-content-between align-items-center">
                <h3 className="mb-0 fw-bold">Преподаватели</h3>

                {/* Поиск */}
                <div className="input-group" style={{ maxWidth: 360 }}>
                    <span className="input-group-text bg-white">
                        <i className="bi bi-search text-secondary"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Поиск по ФИО..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Поиск преподавателя"
                    />
                    {search && (
                        <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setSearch('')}
                            title="Очистить"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    )}
                </div>
            </div>

            <div className="card-body p-4">
                {filteredTeachers.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        <i className="bi bi-search fs-1 d-block mb-2"></i>
                        Ничего не найдено по запросу «{search}»
                    </div>
                ) : (
                    <div className="row g-4">
                        {Object.keys(groupedByLetter).sort().map(letter => (
                            <div className="col-lg-3 col-md-4 col-sm-6" key={letter}>
                                <div className="border rounded p-3 h-100 bg-light">
                                    <h5 className="text-primary border-bottom pb-2 mb-3">{letter}</h5>
                                    <ul className="list-unstyled mb-0">
                                        {groupedByLetter[letter].map(teacher => (
                                            <li key={teacher.id} className="mb-2">
                                                <button
                                                    className="btn btn-link p-0 text-decoration-none text-dark fw-medium text-start w-100"
                                                    onClick={() => setSelectedTeacher(teacher)}
                                                >
                                                    <i className="bi bi-person me-1 text-secondary small"></i>
                                                    {teacher.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeachersPage;