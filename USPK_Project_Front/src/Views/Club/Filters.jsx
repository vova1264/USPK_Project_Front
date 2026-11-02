import { DAYS } from './constants.js';

export default function Filters({
    search, onSearch, location, onLocation, day, onDay,
    locations, onOpenAdd, isAdmin
}) {
    return (
        <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
                <div className="row g-3 align-items-end">
                    <div className="col-lg-4 col-md-6">
                        <label className="form-label fw-semibold" htmlFor="search">Поиск</label>
                        <input
                            id="search" type="text" className="form-control"
                            placeholder="Название, преподаватель, аудитория…"
                            value={search} onChange={(e) => onSearch(e.target.value)}
                        />
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <label className="form-label fw-semibold" htmlFor="loc">Площадка</label>
                        <select
                            id="loc" className="form-select" value={location}
                            onChange={(e) => onLocation(e.target.value)}
                        >
                            <option value="">Все площадки</option>
                            {locations && locations.map((l) => <option key={l}>{l}</option>)}
                        </select>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <label className="form-label fw-semibold" htmlFor="day">День недели</label>
                        <select
                            id="day" className="form-select" value={day}
                            onChange={(e) => onDay(e.target.value)}
                        >
                            <option value="">Все дни</option>
                            {DAYS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                    {isAdmin && (
                        <div className="col-lg-2 col-md-6 d-grid">
                            <button className="btn btn-success" onClick={onOpenAdd}>+ Добавить</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}