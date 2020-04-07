export function saveCustomer (state, data) {
  state.customer = !data ? data : Object.assign({}, data);
}

export function saveNotification (state, notification) {
  if (!notification) {
    state.notifications = {}
    return;
  }
  state.notifications[notification.type] = Object.assign({}, state.notifications[notification.type], {
    [notification._id]: notification.exists,
  });
}
