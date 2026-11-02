// src/Views/Club/ClubDopPage.jsx
import { useCallback, useEffect, useState } from 'react';
import { clubApi } from '../../Services/clubApi.js';
import Header from './Header.jsx';
import Filters from './Filters.jsx';
import ClubGroup from './ClubGroup.jsx';
import AddModal from './AddModal.jsx';
import { DAYS } from './constants.js';
import '../../../public/content/club.css';

export default function ClubDopPage({ isAdmin }) {
    const [records, setRecords] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [day, setDay] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await clubApi.getAll({ location, day, q: search });
            setRecords(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [location, day, search]);

    useEffect(() => {
        clubApi.getLocations().then(setLocations).catch(() => { });
    }, []);

    useEffect(() => {
        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
    }, [load]);

    const groupedByDay = records.reduce((acc, r) => {
        if (!acc[r.day]) acc[r.day] = [];
        acc[r.day].push(r);
        return acc;
    }, {});

    const handleRemove = async (id) => {
        if (!window.confirm('Удалить эту запись из расписания?')) return;
        try {
            await clubApi.remove(id);
            await load();
        } catch (e) {
            alert(e.message);
        }
    };

    const handleAdd = async (record) => {
        try {
            await clubApi.add(record);
            setModalOpen(false);
            await load();
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <>
            <Header />
            <main className="container pb-5">
                <Filters
                    search={search} onSearch={setSearch}
                    location={location} onLocation={setLocation}
                    day={day} onDay={setDay}
                    locations={locations}
                    onOpenAdd={() => setModalOpen(true)}
                    isAdmin={isAdmin}
                />

                <div className="mb-3 text-muted">
                    {loading ? 'Загрузка…' : `Найдено записей: ${records.length}`}
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                {!loading && !error && records.length === 0 && (
                    <div className="text-center text-muted py-5">
                        <h5>Ничего не найдено</h5>
                        <p className="mb-0">Измените параметры поиска или добавьте новую запись.</p>
                    </div>
                )}

                {DAYS.map((dayName) => {
                    const items = groupedByDay[dayName];
                    if (!items || items.length === 0) return null;
                    return (
                        <ClubGroup
                            key={dayName}
                            day={dayName}
                            items={items}
                            onRemove={handleRemove}
                            isAdmin={isAdmin}
                        />
                    );
                })}
            </main>

            <AddModal
                open={modalOpen}
                locations={locations}
                onClose={() => setModalOpen(false)}
                onSubmit={handleAdd}
            />
        </>
    );
}