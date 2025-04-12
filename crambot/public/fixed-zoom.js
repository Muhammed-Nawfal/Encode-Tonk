/**
 * Fixed Zoom Controller
 * 
 * This script enforces a fixed zoom level on the application
 * regardless of user zoom attempts or browser settings.
 */

(function() {
  // Set fixed zoom factor to match the desired view
  const FIXED_ZOOM = 1.0;
  // Calculate the inverse percentage for element sizing
  const ZOOM_INVERSE = (100 / FIXED_ZOOM) + '%';
  
  // Function to apply the fixed zoom
  function applyFixedZoom() {
    // Apply scale transform to both html and body for maximum compatibility
    document.documentElement.style.transform = `scale(${FIXED_ZOOM})`;
    document.documentElement.style.transformOrigin = '0 0';
    document.documentElement.style.width = ZOOM_INVERSE;
    document.documentElement.style.height = ZOOM_INVERSE;
    document.documentElement.style.overflowX = 'hidden';
    
    // Also apply to body for redundancy and better cross-browser support
    document.body.style.transform = `scale(${FIXED_ZOOM})`;
    document.body.style.transformOrigin = '0 0';
    document.body.style.width = ZOOM_INVERSE;
    document.body.style.height = ZOOM_INVERSE;
  }
  
  // Apply fixed zoom immediately
  applyFixedZoom();
  
  // Also apply when DOM is fully loaded to catch any late elements
  window.addEventListener('DOMContentLoaded', applyFixedZoom);
  
  // Re-apply on resize to counteract zoom attempts
  window.addEventListener('resize', applyFixedZoom);
  
  // Re-apply on orientation change for mobile devices
  window.addEventListener('orientationchange', applyFixedZoom);
  
  // Prevent zoom using keyboard shortcuts (Ctrl/Cmd +/-)
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0' || e.key === '=' || e.wheelDelta)) {
      e.preventDefault();
      return false;
    }
  }, { passive: false });
  
  // Prevent pinch zoom on touch devices
  document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) {
      e.preventDefault();
      return false;
    }
  }, { passive: false });
  
  // Also handle wheel events with Ctrl key for mouse wheel zoom
  document.addEventListener('wheel', function(e) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      return false;
    }
  }, { passive: false });
  
  // MutationObserver to ensure zoom is maintained if DOM changes
  const observer = new MutationObserver(function() {
    applyFixedZoom();
  });
  
  // Observe document for changes that might affect zoom
  observer.observe(document.documentElement, { 
    attributes: true,
    childList: true,
    subtree: true 
  });
  
  // Additional fix for iOS and Safari which have special zoom behaviors
  document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
    return false;
  }, { passive: false });
  
  document.addEventListener('gesturechange', function(e) {
    e.preventDefault();
    return false;
  }, { passive: false });
  
  document.addEventListener('gestureend', function(e) {
    e.preventDefault();
    return false;
  }, { passive: false });
})(); 