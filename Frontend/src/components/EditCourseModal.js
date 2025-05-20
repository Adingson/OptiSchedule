import React, { useState, useEffect } from 'react';
import '../styles/CreateSchedule.css'; 

const EditCourseModal = ({ course, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ ...course });

  useEffect(() => {
    setFormData({ ...course });
  }, [course]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!course) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-window edit-course-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">Edit Course</div>
        <form onSubmit={handleSubmit}>
          <label>Course Code:</label>
          <input
            type="text"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleChange}
            required
          />

          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label>Program:</label>
          <select
            name="program"
            value={formData.program}
            onChange={handleChange}
            required
          >
            <option value="BSIT">BS Information Technology</option>
            <option value="BSCS">BS Computer Science</option>
            <option value="BSEMC">BS Entertainment and Multimedia Computing</option>
          </select>

          <label>Year Level:</label>
          <select
            name="yearLevel"
            value={formData.yearLevel}
            onChange={handleChange}
            required
          >
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          <label>Lecture Units:</label>
          <input
            type="number"
            name="unitsLecture"
            value={formData.unitsLecture}
            onChange={handleChange}
            required
          />

          <label>Lab Units:</label>
          <input
            type="number"
            name="unitsLab"
            value={formData.unitsLab}
            onChange={handleChange}
            required
          />

          <label>Blocks:</label>
          <input
            type="number"
            name="blocks"
            value={formData.blocks}
            onChange={handleChange}
            min="1"
            required
          />

          <div className="modal-button-row">
            <button type="submit" className="save-btn">Save Changes</button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourseModal;
