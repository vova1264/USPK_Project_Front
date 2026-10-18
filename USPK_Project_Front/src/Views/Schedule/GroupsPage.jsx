import { useState } from 'react';
import ScheduleTable from './ScheduleTable';

const GroupsPage = ({ data }) => {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [search, setSearch] = useState('');

    if (!data || !data.groups || data.groups.length === 0) {
        return (
            <div className="alert alert-info border-0 shadow-sm">
                <i className="bi bi-info-circle me-2"></i>
                Загрузите файлы расписания, чтобы увидеть данные.
            </div>
        );
    }

    // Фильтруем группы по подстроке (регистронезависимо)
    const filteredGroups = data.groups.filter((g) =>
        g.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    // Группируем уже отфильтрованный список по году (первые цифры до дефиса)
    const groupedByYear = filteredGroups.reduce((acc, group) => {
        const year = group.name.split('-')[0].replace(/\D/g, '');
        if (!acc[year]) acc[year] = [];
        acc[year].push(group);
        return acc;
    }, {});

    // Если группа выбрана — показываем её расписание
    if (selectedGroup) {
        return (
            <div className="card shadow-sm border-0 container">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">
                        Расписание для группы: <span className="text-primary">{selectedGroup.name}</span>
                    </h4>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setSelectedGroup(null)}
                    >
                        <i className="bi bi-arrow-left me-1"></i> Назад к списку групп
                    </button>
                </div>
                <div className="card-body">
                    <ScheduleTable schedule={selectedGroup.schedule} type="group" />
                </div>
            </div>
        );
    }

    // Список групп
    return (
        <div className="card shadow-sm border-0 container">
            <div className="card-header bg-white py-3 d-flex flex-wrap gap-3 justify-content-between align-items-center">
                <h3 className="mb-0 fw-bold">Группы</h3>

                {/* Поиск */}
                <div className="input-group" style={{ maxWidth: 360 }}>
                    <span className="input-group-text bg-white">
                        <i className="bi bi-search text-secondary"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Поиск по группе..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Поиск группы"
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
                {filteredGroups.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        <i className="bi bi-search fs-1 d-block mb-2"></i>
                        Ничего не найдено по запросу «{search}»
                    </div>
                ) : (
                    <div className="row g-4">
                        {Object.keys(groupedByYear).sort().map(year => (
                            <div className="col-lg-3 col-md-4 col-sm-6" key={year}>
                                <div className="border rounded p-3 h-100 bg-light">
                                    <h5 className="text-primary border-bottom pb-2 mb-3">{year}</h5>
                                    <ul className="list-unstyled mb-0">
                                        {groupedByYear[year].map(group => (
                                            <li key={group.id} className="mb-2">
                                                <button
                                                    className="btn btn-link p-0 text-decoration-none text-dark fw-medium text-start w-100"
                                                    onClick={() => setSelectedGroup(group)}
                                                >
                                                    <i className="bi bi-chevron-right me-1 text-secondary small"></i>
                                                    {group.name}
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

export default GroupsPage;