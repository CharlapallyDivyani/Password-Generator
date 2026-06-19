// ── Character sets ──
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS   = '0123456789';
const SYMBOLS   = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Stores the current generated password
let currentPassword = '';

// ── Toggle option boxes (Uppercase / Lowercase / Numbers / Symbols) ──
function toggleOption(id, box) {
  const checkbox = document.getElementById(id);
  const isActive = box.classList.toggle('active');
  checkbox.checked = isActive;
  generatePassword();
}

// ── Build charset based on selected options ──
function buildCharset() {
  let charset = '';
  if (document.getElementById('upper').checked)   charset += UPPERCASE;
  if (document.getElementById('lower').checked)   charset += LOWERCASE;
  if (document.getElementById('numbers').checked) charset += NUMBERS;
  if (document.getElementById('symbols').checked) charset += SYMBOLS;
  return charset;
}

// ── Generate a secure password using the Web Crypto API ──
function generatePassword() {
  const length  = parseInt(document.getElementById('lengthSlider').value);
  const charset = buildCharset();

  if (!charset) {
    document.getElementById('pwDisplay').textContent = 'Select at least one option';
    currentPassword = '';
    updateStrengthBar('');
    return;
  }

  // crypto.getRandomValues() is cryptographically secure
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  currentPassword = Array.from(randomValues)
    .map(val => charset[val % charset.length])
    .join('');

  document.getElementById('pwDisplay').textContent = currentPassword;
  updateStrengthBar(currentPassword);
}

// ── Calculate password strength and update the bar ──
function updateStrengthBar(password) {
  const fill  = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');

  if (!password) {
    fill.style.width  = '0%';
    label.textContent = '—';
    label.style.color = '';
    return;
  }

  // Score based on length and character variety
  let score = 0;
  if (password.length >= 8)           score++;
  if (password.length >= 12)          score++;
  if (password.length >= 20)          score++;
  if (/[A-Z]/.test(password))         score++;
  if (/[a-z]/.test(password))         score++;
  if (/[0-9]/.test(password))         score++;
  if (/[^A-Za-z0-9]/.test(password))  score++;

  const levels = [
    { maxScore: 2, label: 'Weak',       color: '#E24B4A', width: '20%'  },
    { maxScore: 4, label: 'Fair',        color: '#EF9F27', width: '45%'  },
    { maxScore: 5, label: 'Good',        color: '#639922', width: '65%'  },
    { maxScore: 6, label: 'Strong',      color: '#1D9E75', width: '82%'  },
    { maxScore: 7, label: 'Very strong', color: '#0F6E56', width: '100%' },
  ];

  const level = levels.find(l => score <= l.maxScore) || levels[4];

  fill.style.width      = level.width;
  fill.style.background = level.color;
  label.textContent     = level.label;
  label.style.color     = level.color;
}

// ── Copy password to clipboard ──
function copyPassword() {
  if (!currentPassword) return;

  navigator.clipboard.writeText(currentPassword)
    .then(() => {
      showToast();
    })
    .catch(() => {
      // Fallback for browsers that don't support clipboard API
      const temp = document.createElement('textarea');
      temp.value = currentPassword;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      showToast();
    });
}

// ── Show the "Copied!" toast notification ──
function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// ── Generate a password on page load ──
generatePassword();