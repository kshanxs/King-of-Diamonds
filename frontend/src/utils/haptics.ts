// Utility to add haptic feedback to any button
export function triggerHaptic(duration = 30) {
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(duration);
  }
}
