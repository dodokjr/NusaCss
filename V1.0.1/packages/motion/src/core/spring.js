export function springProgress({
  stiffness = 170,
  damping = 26,
  mass = 1,
  velocity = 0
} = {}, progress) {
  const t = Math.max(0, Math.min(1, progress));
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  if (zeta < 1) {
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    const envelope = Math.exp(-zeta * omega * t);
    const result =
      1 -
      envelope *
        (Math.cos(omegaD * t) +
          ((zeta * omega - velocity) / omegaD) *
            Math.sin(omegaD * t));

    return result;
  }

  const result = 1 - Math.exp(-omega * t);
  return result;
}

export function springDuration({
  stiffness = 170,
  damping = 26,
  mass = 1
} = {}) {
  const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));

  if (dampingRatio < 1) {
    return Math.max(300, Math.min(2000, 4 / (dampingRatio * Math.sqrt(stiffness / mass)) * 1000));
  }

  return Math.max(300, Math.min(1500, 5 * Math.sqrt(mass / stiffness) * 1000));
}
