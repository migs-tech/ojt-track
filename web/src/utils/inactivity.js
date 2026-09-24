const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes
let inactivityTimer;

function showLogoutWarning() {
  // ✅ only show modal, do not clear token here
  if (window.showLogoutModal) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastActive");
    window.showLogoutModal();
  }
}

export function resetTimer() {
  clearTimeout(inactivityTimer);
  localStorage.setItem("lastActive", Date.now().toString());
  inactivityTimer = setTimeout(showLogoutWarning, INACTIVITY_LIMIT);
}

export function setupInactivityListener() {
  ["mousemove", "keydown", "click", "scroll"].forEach((event) => {
    window.addEventListener(event, resetTimer);
  });

  // Check inactivity on reload
  const lastActive = localStorage.getItem("lastActive");
  if (lastActive) {
    const elapsed = Date.now() - parseInt(lastActive, 10);
    if (elapsed > INACTIVITY_LIMIT) {
      showLogoutWarning();
      return;
    }
  }

  resetTimer(); // start fresh timer
}
