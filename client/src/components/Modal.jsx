import React, { useState } from "react";
import "../styles/Modal.css"; 
const Modal = ({
  isOpen,
  closeModal,
  title,
  onSave,
  children,
  saveButtonText = "Save",
  cancelButtonText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={closeModal} className="close-button">
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button onClick={closeModal} className="modal-cancel-button">
            {cancelButtonText}
          </button>
          <button onClick={onSave} className="modal-save-button">
            {saveButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
