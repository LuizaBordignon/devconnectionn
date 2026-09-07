export default function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn-secondary" onClick={onClose}>Fechar</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}