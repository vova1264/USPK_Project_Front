// src/Views/Club/AddModal.jsx
import { useEffect, useRef, useState } from 'react';
import { DAYS } from './constants.js';

const EMPTY = {
    program: '',
    teacher: '',
    day: '',
    time: '',
    room: '',
    location: '',
};

export default function AddModal({ open, onClose, onSubmit, locations }) {
    const modalRef = useRef(null);
    const instanceRef = useRef(null);
    const [form, setForm] = useState(EMPTY);

    // Инициализация модального окна Bootstrap
    useEffect(() => {
        if (!modalRef.current) return;

        // Безопасно получаем Modal из глобального объекта
        const Modal = window.bootstrap?.Modal;
        if (!Modal) {
            console.error("Bootstrap Modal не найден. Проверьте подключение bootstrap.bundle.min.js в index.html");
            return;
        }

        instanceRef.current = new Modal(modalRef.current, { backdrop: true });
        const el = modalRef.current;

        el.addEventListener('hidden.bs.modal', onClose);

        return () => {
            el.removeEventListener('hidden.bs.modal', onClose);
            instanceRef.current?.dispose();
        };
    }, [onClose]);

    // Управление показом/скрытием модалки
    useEffect(() => {
        if (!instanceRef.current) return;
        if (open) {
            instanceRef.current.show();
        } else {
            instanceRef.current.hide();
        }
    }, [open]);

    // Вычисляемое значение для локации: если в стейте пусто, берем первую из списка
    const currentLocation = form.location || (locations && locations.length > 0 ? locations[0] : '');

    const change = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const submit = (e) => {
        e.preventDefault();
        
        const finalForm = { ...form, location: currentLocation };

        const trimmed = Object.fromEntries(
            Object.entries(finalForm).map(([k, v]) => [k, v.trim()])
        );

        if (Object.values(trimmed).some((v) => !v)) {
            alert('Заполните все поля формы.');
            return;
        }

        onSubmit(trimmed);
        setForm(EMPTY);
        instanceRef.current?.hide();
    };

    return (
        <div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <form className="modal-content" onSubmit={submit}>
                    <div className="modal-header">
                        <h5 className="modal-title">Новая запись в расписании</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => instanceRef.current?.hide()}
                        />
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Название программы *</label>
                            <input
                                className="form-control"
                                name="program"
                                maxLength={120}
                                value={form.program}
                                onChange={change}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Преподаватель *</label>
                            <input
                                className="form-control"
                                name="teacher"
                                maxLength={80}
                                value={form.teacher}
                                onChange={change}
                                required
                            />
                        </div>

                        <div className="row g-3">
                            <div className="col-sm-6">
                                <label className="form-label">День недели *</label>
                                <select
                                    className="form-select"
                                    name="day"
                                    value={form.day}
                                    onChange={change}
                                    required
                                >
                                    <option value="" disabled>Выберите…</option>
                                    {DAYS.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-sm-6">
                                <label className="form-label">Время *</label>
                                <input
                                    className="form-control"
                                    name="time"
                                    placeholder="14:30-16:00"
                                    value={form.time}
                                    onChange={change}
                                    required
                                />
                            </div>

                            <div className="col-sm-6">
                                <label className="form-label">Аудитория *</label>
                                <input
                                    className="form-control"
                                    name="room"
                                    maxLength={20}
                                    value={form.room}
                                    onChange={change}
                                    required
                                />
                            </div>

                            <div className="col-sm-6">
                                <label className="form-label">Площадка *</label>
                                <select
                                    className="form-select"
                                    name="location"
                                    value={currentLocation}
                                    onChange={change}
                                    required
                                >
                                    <option value="" disabled>Выберите площадку</option>
                                    {locations && locations.map((l) => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => instanceRef.current?.hide()}
                        >
                            Отмена
                        </button>
                        <button type="submit" className="btn btn-success">
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}