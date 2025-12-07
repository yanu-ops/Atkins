const PHILIPPINES_TIMEZONE = 'Asia/Manila';

const convertToPhilippinesTime = (date) => {
  if (!date) return null;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date:', date);
      return new Date();
    }
    
    const utcTime = dateObj.getTime();
    
    const phTimeString = new Date(utcTime).toLocaleString('en-US', {
      timeZone: PHILIPPINES_TIMEZONE
    });
    
    return new Date(phTimeString);
  } catch (error) {
    console.error('Error converting to PH time:', error);
    return new Date();
  }
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₱0.00';
  
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
};

export const formatDecimal = (num, decimals = 2) => {
  if (num === null || num === undefined) return '0.00';
  
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

export const formatInteger = (num) => {
  if (num === null || num === undefined) return '0';
  
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.floor(num));
};

export const formatDateTime = (date) => {
  if (!date) return '';
  
  try {
    const phDate = convertToPhilippinesTime(date);
    
    return phDate.toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    const phDate = convertToPhilippinesTime(date);
    
    return phDate.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatTime = (date) => {
  if (!date) return '';
  
  try {
    const phDate = convertToPhilippinesTime(date);
    
    return phDate.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

export const getCurrentPhilippinesTime = () => {
  try {
    const now = new Date();
    
    const phTimeString = now.toLocaleString('en-US', {
      timeZone: PHILIPPINES_TIMEZONE
    });
    
    return new Date(phTimeString);
  } catch (error) {
    console.error('Error getting PH time:', error);
    return new Date();
  }
};

export const formatFullDateTime = (date) => {
  if (!date) return '';
  
  try {
    const phDate = convertToPhilippinesTime(date);
    
    return phDate.toLocaleString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting full date:', error);
    return '';
  }
};

export const formatReceiptDateTime = (date) => {
  if (!date) return '';
  
  try {
    const phDate = convertToPhilippinesTime(date);
    
    return phDate.toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting receipt date:', error);
    return '';
  }
};

export const formatDateForInput = (date) => {
  if (!date) return '';
  
  try {
    const phDate = convertToPhilippinesTime(date);
    
    const year = phDate.getFullYear();
    const month = String(phDate.getMonth() + 1).padStart(2, '0');
    const day = String(phDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

export const getTodayPhilippines = () => {
  const phDate = getCurrentPhilippinesTime();
  return formatDateForInput(phDate);
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const now = getCurrentPhilippinesTime();
    const past = convertToPhilippinesTime(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return formatDate(date);
  } catch (error) {
    return formatDate(date);
  }
};

export const getCurrentPhilippinesISO = () => {
  const phDate = getCurrentPhilippinesTime();
  const offset = 8 * 60;
  const phTime = new Date(phDate.getTime() + (offset * 60 * 1000));
  return phTime.toISOString();
};

export const displayCurrentPhTime = () => {
  const phDate = getCurrentPhilippinesTime();
  return formatDateTime(phDate);
};

export const getPhilippinesTimeComponents = (date = null) => {
  const phDate = date ? convertToPhilippinesTime(date) : getCurrentPhilippinesTime();
  
  return {
    fullDate: formatDateTime(phDate),
    date: formatDate(phDate),
    time: formatTime(phDate),
    year: phDate.getFullYear(),
    month: phDate.getMonth() + 1,
    day: phDate.getDate(),
    hours: phDate.getHours(),
    minutes: phDate.getMinutes(),
    seconds: phDate.getSeconds()
  };
};

export const TIMEZONE = PHILIPPINES_TIMEZONE;
