export function saveUserProfile (state, data) {
  state.userProfile = !data ? data : Object.assign({}, data);
}

export function saveNotification (state, notification) {
  state.notifications[notification.type] = Object.assign({}, state.notifications[notification.type], {
    [notification._id]: notification.exists,
  });
}
