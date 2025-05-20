import React, { useState } from 'react';
import '../styles/CreateSchedule.css';

const FacultyEditModal = ({ faculty, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...faculty });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();                     
    onSave(faculty.id, formData); 
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-window faculty-edit-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">Edit Faculty</div>
        <form onSubmit={handleSubmit}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Specialization:</label>
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            required
          />

          <label>Academic Rank:</label>
          <input
            type="text"
            name="AcademicRank"
            value={formData.AcademicRank}
            onChange={handleChange}
            required
          />

          <label>Department:</label>
          <input
            type="text"
            name="Department"
            value={formData.Department}
            onChange={handleChange}
            required
          />

          <label>Educational Attainment:</label>
          <input
            type="text"
            name="Educational_attainment"
            value={formData.Educational_attainment}
            onChange={handleChange}
            required
          />

          <label>Sex:</label>
          <select
            name="Sex"
            value={formData.Sex}
            onChange={handleChange}
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <label>Status:</label>
          <select
            name="Status"
            value={formData.Status}
            onChange={handleChange}
            required
          >
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
          </select>

          <div className="modal-button-row">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyEditModal;
