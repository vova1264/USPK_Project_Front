import ClubCard from './ClubCard.jsx';

export default function ClubGroup({ day, items, onRemove, isAdmin }) {
  return (
    <>
      <h4 className="h6 text-uppercase text-secondary fw-bold mt-4 mb-3 border-bottom pb-2">
        {day}
      </h4>
      <div className="schedule-grid">
        {items.map((item) => (
            <ClubCard key={item.id} record={item} onRemove={onRemove}  isAdmin={isAdmin} />
        ))}
      </div>
    </>
  );
}