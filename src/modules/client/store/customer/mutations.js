export function saveCustomer (state, data) {
  state.customer = !data ? data : Object.assign({}, data);
}

export function saveNotification (state, notification) {
  state.notifications[notification.type] = Object.assign({}, state.notifications[notification.type], {
    [notification._id]: notification.exists,
  });
}
