let active = false;

export function setKidModeActive(value: boolean) {
  active = value;
}

export function isKidModeActive() {
  return active;
}
