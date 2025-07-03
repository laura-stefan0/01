/**
 * Utility functions for consistent date and time formatting throughout the application
 * Date format: DD-MM-YYYY
 * Time format: 24-hour (HH:MM)
 */

export function formatDate(dateInput: string | Date): string {
  let date: Date;
  
  if (typeof dateInput === 'string') {
    // Handle various string formats
    if (dateInput === 'Today') {
      date = new Date();
    } else if (dateInput === 'Tomorrow') {
      date = new Date();
      date.setDate(date.getDate() + 1);
    } else if (dateInput.startsWith('Next')) {
      // Handle "Next Sunday", "Next Week", etc.
      date = new Date();
      date.setDate(date.getDate() + 7);
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = dateInput;
  }

  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

export function formatTime(timeInput: string): string {
  // Convert 12-hour format to 24-hour format
  if (timeInput.includes('AM') || timeInput.includes('PM')) {
    const [time, period] = timeInput.split(' ');
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);
    
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes}`;
  }
  
  // Already in 24-hour format or needs formatting
  const [hours, minutes] = timeInput.split(':');
  return `${hours.padStart(2, '0')}:${minutes}`;
}

export function formatDateTime(date: string, time: string): string {
  return `${formatDate(date)}, ${formatTime(time)}`;
}