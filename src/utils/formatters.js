// src/utils/formatters.js

/**
 * Format number as Philippine Peso currency
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };
  
  /**
   * Format date and time
   */
  export const formatDateTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Format date only
   */
  export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  /**
   * Format time only
   */
  export const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Format number with commas
   */
  export const formatNumber = (num) => {
    return new Intl.NumberFormat('en-PH').format(num || 0);
  };
  
  /**
   * Truncate long text
   */
  export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };