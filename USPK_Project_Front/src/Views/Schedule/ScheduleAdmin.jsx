import { useEffect, useRef, useState } from 'react';
import { scheduleApi } from '../../Services/scheduleApi';

const ScheduleAdmin = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selected, setSelected] = useState([]); // имена выбранных для удаления
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const inputRef = useRef(null);

    const load = async () => {
        try {
            setError(null);
            const data = await scheduleApi.getFiles();
            setFiles(Array.isArray(data) ? data : []);
            // чистим выделение от несуществующих файлов
            setSelected(prev => prev.filter(name => (Array.isArray(data) ? data : []).some(f => f.name === name)));
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        queueMicrotask(() => {
            load();
        });
    }, []);

    const handleUpload = async (e) => {
        const picked = Array.from(e.target.files || []);
        if (picked.length === 0) return;

        // валидация всех файлов до отправки
        const bad = picked.find(f => {
            const ext = f.name.split('.').pop().toLowerCase();
            return !['doc', 'docx'].includes(ext);
        });
        if (bad) {
            setError(`Файл «${bad.name}»: разрешены только .doc и .docx`);
            if (inputRef.current) inputRef.current.value = '';
            return;
        }

        try {
            setUploading(true);
            setError(null);
            setSuccess(null);
            const result = await scheduleApi.uploadMany(picked);
            // result может содержать { message, uploaded: [...], skipped: [...] }
            const uploaded = result?.uploaded ?? [];
            const skipped = result?.skipped ?? [];
            const parts = [];
            if (uploaded.length) parts.push(`Загружено: ${uploaded.length}`);
            if (skipped.length) parts.push(`Пропущено: ${skipped.length} (${skipped.map(s => s.name ?? s).join(', ')})`);
            setSuccess(parts.length ? parts.join('. ') + '.' : 'Файлы обработаны.');

            setLoading(true);
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const toggleSelected = (name) => {
        setSelected(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    const toggleAll = () => {
        setSelected(prev =>
            prev.length === files.length ? [] : files.map(f => f.name)
        );
    };

    const handleDeleteOne = async (name) => {
        if (!window.confirm(`Удалить файл «${name}» и запись из docs.json?`)) return;
        try {
            setDeleting(true);
            setError(null);
            setSuccess(null);
            await scheduleApi.deleteMany([name]);
            setSuccess(`Файл «${name}» удалён.`);
            setFiles(prev => prev.filter(f => f.name !== name));
            setSelected(prev => prev.filter(n => n !== name));
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteSelected = async () => {
        if (selected.length === 0) return;
        if (!window.confirm(`Удалить ${selected.length} файл(ов) и записи из docs.json?`)) return;
        try {
            setDeleting(true);
            setError(null);
            setSuccess(null);
            const result = await scheduleApi.deleteMany(selected);
            const deleted = result?.deleted ?? selected;
            const notFound = result?.notFound ?? [];
            const parts = [`Удалено: ${deleted.length}`];
            if (notFound.length) parts.push(`не найдено: ${notFound.length}`);
            setSuccess(parts.join(', ') + '.');
            const gone = new Set(deleted);
            setFiles(prev => prev.filter(f => !gone.has(f.name)));
            setSelected([]);
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const allChecked = files.length > 0 && selected.length === files.length;

    return (
        <div className="card shadow-sm border-0 container">
            <div className="card-header bg-white py-3 d-flex flex-wrap gap-3 justify-content-between align-items-center">
                <h3 className="mb-0 fw-bold">
                    <i className="bi bi-calendar2-plus me-2"></i>
                    Управление расписанием
                </h3>

                <div className="d-flex flex-wrap gap-2">
                    {selected.length > 0 && (
                        <button
                            className="btn btn-outline-danger"
                            disabled={deleting || uploading}
                            onClick={handleDeleteSelected}
                        >
                            {deleting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Удаление...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-trash me-1"></i>
                                    Удалить выбранные ({selected.length})
                                </>
                            )}
                        </button>
                    )}

                    <input
                        ref={inputRef}
                        type="file"
                        accept=".doc,.docx"
                        multiple
                        className="d-none"
                        onChange={handleUpload}
                    />
                    <button
                        className="btn btn-primary"
                        disabled={uploading || deleting}
                        onClick={() => inputRef.current?.click()}
                    >
                        {uploading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Загрузка...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-upload me-1"></i>
                                Загрузить файлы
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="card-body p-4">
                {error && (
                    <div className="alert alert-danger border-0">
                        <i className="bi bi-x-circle me-2"></i>{error}
                    </div>
                )}
                {success && (
                    <div className="alert alert-success border-0">
                        <i className="bi bi-check-circle me-2"></i>{success}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status" />
                    </div>
                ) : files.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        <i className="bi bi-folder2-open fs-1 d-block mb-2"></i>
                        Пока нет загруженных файлов расписания.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover align-middle bg-white">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: 40 }} className="text-center">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={allChecked}
                                            onChange={toggleAll}
                                            title="Выбрать все"
                                        />
                                    </th>
                                    <th style={{ width: 60 }}>#</th>
                                    <th>Имя файла</th>
                                    <th>Ссылка</th>
                                    <th style={{ width: 120 }} className="text-center">Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map((f, i) => (
                                    <tr key={f.name}>
                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={selected.includes(f.name)}
                                                onChange={() => toggleSelected(f.name)}
                                            />
                                        </td>
                                        <td className="text-muted">{i + 1}</td>
                                        <td className="fw-medium">{f.name}</td>
                                        <td>
                                            <a href={f.url} target="_blank" rel="noreferrer">
                                                {f.url}
                                            </a>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleDeleteOne(f.name)}
                                                disabled={deleting}
                                                title="Удалить файл"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheduleAdmin;