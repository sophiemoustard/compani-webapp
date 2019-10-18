export function getUserProfile (state) {
  return state.userProfile;
}

export function getNotifications (state) {
  return state.notifications;
}

export function getNotificationsProfiles (state) {
  return state.notifications.profiles;
}

export function getNotificationsContracts (state) {
  return state.notifications.contracts;
}

export function getNotificationsTasks (state) {
  return state.notifications.tasks;
}
