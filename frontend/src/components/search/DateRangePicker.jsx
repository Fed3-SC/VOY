import { useState, useRef, useEffect } from 'react';
import './DateRangePicker.css';

// Utilidades para fechas
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

export default function DateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange, minDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [hoverDate, setHoverDate] = useState(null);
  
  const dropdownRef = useRef(null);

  // Parsear minDate (yyyy-mm-dd)
  const minDateObj = minDate ? new Date(minDate + 'T00:00:00') : new Date();
  minDateObj.setHours(0, 0, 0, 0);

  // Cerrar al clickear afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const formatDateStr = (dateObj) => {
    if (!dateObj) return '';
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const parseDateStr = (str) => {
    if (!str) return null;
    const d = new Date(str + 'T00:00:00');
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const startObj = parseDateStr(startDate);
  const endObj = parseDateStr(endDate);

  const handleDateClick = (dateObj) => {
    if (dateObj < minDateObj) return;

    const dateStr = formatDateStr(dateObj);

    // Si no hay inicio, setea inicio
    if (!startDate) {
      onStartDateChange(dateStr);
    } 
    // Si hay inicio pero no fin
    else if (!endDate) {
      if (dateObj < startObj) {
        // Seleccionó una fecha anterior, reiniciar rango
        onStartDateChange(dateStr);
        onEndDateChange('');
      } else {
        onEndDateChange(dateStr);
        setIsOpen(false); // Cerrar al completar rango
      }
    } 
    // Si ya hay ambos, reiniciar selección empezando por este
    else {
      onStartDateChange(dateStr);
      onEndDateChange('');
    }
  };

  const renderCalendar = (monthOffset) => {
    let m = currentMonth + monthOffset;
    let y = currentYear;
    if (m > 11) { m -= 12; y += 1; }
    
    const daysInMonth = getDaysInMonth(y, m);
    const firstDay = getFirstDayOfMonth(y, m);
    
    const days = [];
    
    // Celdas vacías al principio
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Días del mes
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(y, m, d);
      dateObj.setHours(0, 0, 0, 0);
      
      const isPast = dateObj < minDateObj;
      const isStart = startObj && dateObj.getTime() === startObj.getTime();
      const isEnd = endObj && dateObj.getTime() === endObj.getTime();
      
      let isBetween = false;
      let isHoverBetween = false;

      if (startObj && endObj) {
        isBetween = dateObj > startObj && dateObj < endObj;
      } else if (startObj && hoverDate && !endObj) {
        if (hoverDate > startObj) {
          isHoverBetween = dateObj > startObj && dateObj < hoverDate;
        }
      }

      let classes = 'calendar-day';
      if (isPast) classes += ' disabled';
      if (isStart) classes += ' start-date selected';
      if (isEnd) classes += ' end-date selected';
      if (isBetween) classes += ' in-range';
      if (isHoverBetween) classes += ' hover-range';

      days.push(
        <button
          key={`day-${d}`}
          type="button"
          disabled={isPast}
          className={classes}
          onClick={(e) => {
            e.stopPropagation();
            handleDateClick(dateObj);
          }}
          onMouseEnter={() => {
            if (startObj && !endObj && !isPast) {
              setHoverDate(dateObj);
            }
          }}
          onMouseLeave={() => {
            if (startObj && !endObj) {
              setHoverDate(null);
            }
          }}
        >
          {d}
        </button>
      );
    }

    return (
      <div className="calendar-month">
        <div className="calendar-month-header">
          {MONTHS[m]} {y}
        </div>
        <div className="calendar-weekdays">
          {DAYS.map(day => <div key={day} className="calendar-weekday">{day}</div>)}
        </div>
        <div className="calendar-days-grid">
          {days}
        </div>
      </div>
    );
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="drp-wrapper" ref={dropdownRef}>
      <div className="drp-inputs" onClick={() => setIsOpen(true)}>
        <div className="search-field">
          <label className="search-label">
            <span className="search-icon">📅</span>
            Fecha de Ida
          </label>
          <div className={`drp-faux-input ${!startDate ? 'placeholder' : ''}`}>
            {startDate ? formatDisplayDate(startDate) : 'Ida'}
          </div>
        </div>

        <div className="search-field">
          <label className="search-label">
            <span className="search-icon">📅</span>
            Fecha de Vuelta
          </label>
          <div className={`drp-faux-input ${!endDate ? 'placeholder' : ''}`}>
            {endDate ? formatDisplayDate(endDate) : 'Opcional'}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="drp-dropdown">
          <div className="drp-header">
            <button type="button" className="drp-nav-btn" onClick={handlePrevMonth}>←</button>
            <div className="drp-header-title">Seleccioná tus fechas</div>
            <button type="button" className="drp-nav-btn" onClick={handleNextMonth}>→</button>
          </div>
          
          <div className="drp-calendars">
            {renderCalendar(0)}
            {/* Ocultar el segundo calendario en mobile */}
            <div className="drp-calendar-desktop">
              {renderCalendar(1)}
            </div>
          </div>
          
          <div className="drp-footer">
            <button 
              type="button" 
              className="drp-clear-btn"
              onClick={() => {
                onStartDateChange('');
                onEndDateChange('');
              }}
            >
              Limpiar
            </button>
            <button 
              type="button" 
              className="drp-apply-btn"
              onClick={() => setIsOpen(false)}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
