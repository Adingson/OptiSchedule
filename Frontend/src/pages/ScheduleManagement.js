
import React, { useEffect, useState } from 'react';
import {
  generateSchedule,
  saveFinalSchedule,
  overrideEvent,
  getFinalSchedules,
  getFinalSchedule,
} from '../services/scheduleService';
import {
  getFacultyList,
  assignFacultyToEvent,
  unassignFacultyFromGroup,
} from '../services/facultyService';
import ScheduleFilters from '../components/ScheduleFilters';
import ScheduleGrid from '../components/ScheduleGrid';
import FacultyPanel from '../components/FacultyPanel';
import FacultyModal from '../components/FacultyModal';
import OverrideModal from '../components/OverrideModal';
import UnassignConfirmationModal from '../components/UnassignConfirmationModal';
import SuccessModal from '../components/SuccessModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { computeGroupKey } from '../utils/scheduleHelpers';
import '../styles/ScheduleManagement.css';
import noFacultyLogo from '../assets/noFacultyLogo.png';
import FacultyLoader from '../animations/FacultyLoader';

const ScheduleManagement = () => {
  const [schedule, setSchedule] = useState([]);
  const [scheduleError, setScheduleError] = useState(false);
  const [faculty, setFaculty] = useState([]);
  const [facultyFetchError, setFacultyFetchError] = useState(false);
  const [filters, setFilters] = useState({
    program: 'all',
    year: 'all',
    block: 'all',
    courseQuery: '',
    day: 'all',
    showUnassignedOnly: false,
  });
  const [facultySearch, setFacultySearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [modalFaculty, setModalFaculty] = useState(null);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideEventData, setOverrideEventData] = useState(null);
  const [roomsData, setRoomsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [displayScheduleName, setDisplayScheduleName] = useState(
    localStorage.getItem('scheduleName') || 'Default Schedule'
  );
  const [unassignModalData, setUnassignModalData] = useState(null);
  const [successModalData, setSuccessModalData] = useState(null);
  const [confirmationModalData, setConfirmationModalData] = useState(null);

  
  const [isFacultyLoading, setIsFacultyLoading] = useState(false);

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchCurrentSchedule = async () => {
      setLoading(true);
      setLoadingMessage('Retrieving generated schedule, please wait...');
      try {
        const data = await generateSchedule(false, true);
        if (data.status === 'success' && data.schedule) {
          setSchedule(data.schedule);
          setScheduleError(false);
          if (data.rooms) setRoomsData(data.rooms);
        } else {
          setSchedule([]);
          setScheduleError(true);
          if (data.rooms) setRoomsData(data.rooms);
        }
      } catch (error) {
        console.error('Error fetching current schedule:', error);
        setScheduleError(true);
      } finally {
        setLoading(false);
        setLoadingMessage('');
      }
    };
    fetchCurrentSchedule();
  }, []);

  
  useEffect(() => {
    const fetchFacultyData = async () => {
      setIsFacultyLoading(true);
      try {
        const data = await getFacultyList();
        if (data.status === 'success') {
          setFaculty(data.faculty || []);
          setFacultyFetchError(false);
        } else {
          setFacultyFetchError(true);
        }
      } catch (error) {
        console.error('Error fetching faculty:', error);
        setFacultyFetchError(true);
      } finally {
        setIsFacultyLoading(false);
      }
    };
    fetchFacultyData();
  }, []);

  
  useEffect(() => {
    const fetchExistingSchedules = async () => {
      try {
        const data = await getFinalSchedules();
        if (data && data.schedules) {
          setExistingSchedules(data.schedules);
        }
      } catch (err) {
        console.error('Error fetching Schedules list:', err);
      }
    };
    fetchExistingSchedules();
  }, []);

  
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFacultySearchChange = (e) => {
    setFacultySearch(e.target.value);
  };

  
  const filteredSchedule = (schedule || []).filter((event) => {
    const { program, year, block, courseQuery, day, showUnassignedOnly } = filters;
    if (program !== 'all' && event.program !== program) return false;
    if (year !== 'all' && event.year !== parseInt(year)) return false;
    if (block !== 'all' && event.block !== block) return false;
    if (
      courseQuery &&
      !event.courseCode.toLowerCase().includes(courseQuery.toLowerCase()) &&
      !event.title.toLowerCase().includes(courseQuery.toLowerCase())
    )
      return false;
    if (day !== 'all' && event.day !== day) return false;
    if (showUnassignedOnly && event.faculty && event.faculty.trim() !== '') return false;
    return true;
  });

  
  const groupByDay = (events) =>
    events.reduce((acc, event) => {
      const eventDay = event.day || 'Other';
      if (!acc[eventDay]) acc[eventDay] = [];
      acc[eventDay].push(event);
      return acc;
    }, {});

  const groupedSchedule = groupByDay(filteredSchedule);

  
  const handleSaveFinalSchedule = async () => {
    setLoading(true);
    setLoadingMessage('Saving Schedule, please wait...');
    const finalSchedule = {
      schedule_name: displayScheduleName,
      schedule: schedule,
    };
    try {
      const response = await saveFinalSchedule(finalSchedule);
      if (response.status === 'success') {
        localStorage.setItem('finalScheduleName', finalSchedule.schedule_name);
        setSuccessModalData({ message: 'Generated schedule saved successfully.', type: 'success' });
      } else {
        setSuccessModalData({ message: 'Error saving schedule: ' + response.message, type: 'error' });
      }
    } catch (error) {
      console.error('Error saving Schedule:', error);
      setSuccessModalData({ message: 'Error saving Schedule.', type: 'error' });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  
  const handleSelectExistingSchedule = async (e) => {
    const selectedName = e.target.value;
    if (selectedName) {
      setConfirmationModalData({
        title: 'Load Schedule Confirmation',
        message: 'Loading an existing schedule will discard any unsaved changes. Do you want to continue?',
        onConfirm: async () => {
          setConfirmationModalData(null);
          setLoading(true);
          setLoadingMessage('Retrieving existing schedule, please wait...');
          try {
            const data = await getFinalSchedule(selectedName);
            if (data && data.schedule) {
              setSchedule(data.schedule);
              setScheduleError(false);
              const newName = data.schedule_name || selectedName;
              setDisplayScheduleName(newName);
              localStorage.setItem('scheduleName', newName);
              setSuccessModalData({ message: 'Schedule loaded successfully.', type: 'success' });
            }
          } catch (err) {
            console.error('Error fetching selected schedule:', err);
            setSuccessModalData({ message: 'Error fetching selected schedule.', type: 'error' });
          } finally {
            setLoading(false);
            setLoadingMessage('');
          }
        },
        onCancel: () => {
          setConfirmationModalData(null);
          e.target.value = '';
        },
      });
    }
  };

  
  const handleToggleGroupSelection = (event) => {
    const groupKey = computeGroupKey(event);
    if (selectedGroup && selectedGroup.groupKey === groupKey) {
      setSelectedGroup(null);
    } else {
      const groupEvents = (schedule || []).filter((e) => computeGroupKey(e) === groupKey);
      setSelectedGroup({ groupKey, groupEvents });
    }
  };

  
  const handleAssignFaculty = async (facultyObj) => {
    if (!selectedGroup) return;
    try {
      const firstEvent = selectedGroup.groupEvents[0];
      const response = await assignFacultyToEvent(firstEvent.schedule_id, facultyObj.id);
      if (response.status === 'success') {
        setSchedule((prevSchedule) =>
          (prevSchedule || []).map((event) =>
            computeGroupKey(event) === selectedGroup.groupKey
              ? { ...event, faculty: facultyObj.name }
              : event
          )
        );
        setSelectedGroup(null);
      }
    } catch (error) {
      console.error('Error assigning faculty:', error);
    }
  };

  
  const handleOverride = (scheduleId) => {
    const event = (schedule || []).find((e) => e.schedule_id === scheduleId);
    if (event) {
      setOverrideEventData(event);
      setIsOverrideModalOpen(true);
    }
  };

  const closeOverrideModal = () => {
    setIsOverrideModalOpen(false);
    setOverrideEventData(null);
  };

  
  const handleSaveOverride = async (overrideDetails) => {
    try {
      const response = await overrideEvent(overrideDetails);
      if (response.status === 'success') {
        setSuccessModalData({ message: 'Override saved successfully.', type: 'success' });
        
        const data = await generateSchedule(false, true);
        if (data.status === 'success' && data.schedule) {
          setSchedule(data.schedule);
          setScheduleError(false);
          if (data.rooms) setRoomsData(data.rooms);
        } else {
          setSchedule([]);
          setScheduleError(true);
        }
      } else {
        setSuccessModalData({ message: 'Override failed: ' + (response.detail || 'Overlap detected.'), type: 'error' });
      }
    } catch (error) {
      console.error('Error overriding event:', error);
      setSuccessModalData({ message: 'Error: ' + error.message, type: 'error' });
    } finally {
      closeOverrideModal();
    }
  };

  const getAssignedEventsForFaculty = (facultyName) =>
    (schedule || []).filter((event) => event.faculty === facultyName);

  const openFacultyModal = (facultyObj) => {
    setModalFaculty(facultyObj);
    setIsFacultyModalOpen(true);
  };

  const closeFacultyModal = () => {
    setIsFacultyModalOpen(false);
    setModalFaculty(null);
  };

  const closeSuccessModal = () => {
    setSuccessModalData(null);
  };

  return (
    <div className="schedule-management-container">
      <div className="content">
        <div className="left-panel">
          <ScheduleFilters filters={filters} onFilterChange={handleFilterChange} />
          <ScheduleGrid
            groupedSchedule={groupedSchedule}
            daysOrder={daysOrder}
            selectedGroup={selectedGroup}
            onToggleGroupSelection={handleToggleGroupSelection}
            onOverride={handleOverride}
            displayScheduleName={displayScheduleName}
            onSaveFinalSchedule={handleSaveFinalSchedule}
            onSelectExistingSchedule={handleSelectExistingSchedule}
            existingSchedules={existingSchedules}
            fetchError={scheduleError}
          />
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>{loadingMessage}</p>
            </div>
          )}
        </div>
        <div className="right-panel">
          <FacultyPanel
            faculty={faculty}
            facultySearch={facultySearch}
            onFacultySearchChange={handleFacultySearchChange}
            selectedGroup={selectedGroup}
            schedule={schedule}
            onAssignFaculty={handleAssignFaculty}
            onOpenFacultyModal={openFacultyModal}
            isLoadingFaculty={isFacultyLoading}
            fetchError={facultyFetchError}
          />
        </div>
      </div>

      {isFacultyModalOpen && modalFaculty && (
        <FacultyModal
          faculty={modalFaculty}
          assignedEvents={getAssignedEventsForFaculty(modalFaculty.name)}
          onClose={closeFacultyModal}
          onRequestUnassignGroup={(groupKey, groupEvents, facultyName) => {
            setUnassignModalData({ groupKey, groupEvents, facultyName });
          }}
        />
      )}

      {unassignModalData && (
        <UnassignConfirmationModal
          groupEvents={unassignModalData.groupEvents}
          facultyName={unassignModalData.facultyName}
          onCancel={() => setUnassignModalData(null)}
          onConfirm={() => {
            const sampleEvent = unassignModalData.groupEvents[0];
            const groupParams = {
              courseCode: sampleEvent.courseCode,
              program: sampleEvent.program,
              block: sampleEvent.block,
            };
            unassignFacultyFromGroup(groupParams)
              .then((response) => {
                if (response.status === 'success' && response.events) {
                  setSchedule((prevSchedule) =>
                    (prevSchedule || []).map((event) => {
                      if (response.events.find((e) => e.schedule_id === event.schedule_id)) {
                        return { ...event, faculty: '' };
                      }
                      return event;
                    })
                  );
                  setSuccessModalData({ message: 'Faculty unassigned successfully.', type: 'success' });
                }
                setUnassignModalData(null);
              })
              .catch((err) => {
                console.error('Error unassigning faculty:', err);
                setUnassignModalData(null);
              });
          }}
        />
      )}

      {isOverrideModalOpen && overrideEventData && (
        <OverrideModal
          event={overrideEventData}
          roomsData={roomsData}
          schedule={schedule}
          onClose={closeOverrideModal}
          onSave={handleSaveOverride}
        />
      )}

      {successModalData && (
        <SuccessModal
          message={successModalData.message}
          type={successModalData.type}
          onClose={closeSuccessModal}
        />
      )}

      {confirmationModalData && (
        <ConfirmationModal
          title={confirmationModalData.title}
          message={confirmationModalData.message}
          onConfirm={confirmationModalData.onConfirm}
          onCancel={confirmationModalData.onCancel}
        />
      )}
    </div>
  );
};

export default ScheduleManagement;
