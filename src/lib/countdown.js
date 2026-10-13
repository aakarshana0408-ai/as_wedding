export function getCountdown(target, now = Date.now()) {
  const targetTime = Date.parse(target);
  if (!Number.isFinite(targetTime) || !Number.isFinite(now)) {
    throw new RangeError('Countdown requires a valid target timestamp and current time.');
  }
  // Ceiling keeps the last second visible until the exact ceremony start.
  const totalSeconds = Math.max(0, Math.ceil((targetTime - now) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    complete: totalSeconds === 0,
  };
}
