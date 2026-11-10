export function countUp(
    el,
    to = Number(el.dataset.count),
    duration = 1200
  ) {
    if (!el || !Number.isFinite(to)) {
      throw new TypeError("Invalid countUp arguments.");
    }
  
    let frame = 0;
    let cancelled = false;
  
    const start = performance.now();
    const from = Number(el.dataset.from || 0);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
  
    const easeOut = t => 1 - Math.pow(1 - t, 3);
  
    function update(now) {
      if (cancelled || !el.isConnected) {
        return;
      }
  
      const progress = duration <= 0
        ? 1
        : Math.min((now - start) / duration, 1);
  
      const value = from + (to - from) * easeOut(progress);
  
      el.textContent =
        prefix +
        Math.round(value).toLocaleString("id-ID") +
        suffix;
  
      if (progress < 1) {
        frame = requestAnimationFrame(update);
      }
    }
  
    frame = requestAnimationFrame(update);
  
    return {
      cancel() {
        cancelled = true;
        cancelAnimationFrame(frame);
      }
    };
  }