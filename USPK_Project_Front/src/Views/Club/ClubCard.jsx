export default function ClubCard({ record, onRemove, isAdmin }) {
    return (
        <div className="circle-card card bg-white p-3 position-relative">
            {isAdmin && (
                <button
                    className="btn-remove"
                    type="button"
                    title="Удалить запись"
                    aria-label="Удалить запись"
                    onClick={() => onRemove(record.id)}
                >
                    &times;
                </button>
            )}
            <div className="program">{record.program}</div>

            <div className="small text-secondary">
                <strong>Преподаватель:</strong> {record.teacher}
            </div>

            <div className="d-flex flex-wrap gap-2 mt-auto pt-2">
                <span className="badge-soft badge-day">{record.day}</span>
                <span className="badge-soft badge-time">{record.time}</span>
                <span className="badge-soft badge-room">ауд. {record.room}</span>
            </div>
        </div>
    );
}