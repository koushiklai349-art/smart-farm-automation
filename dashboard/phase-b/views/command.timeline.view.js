const timeline = [];

export function pushCommandEvent(event) {
  timeline.push(event);
}

export function getTimeline() {
  return timeline.slice(-50);
}
