import events from '../api/Events';

export default ({ app, router, Vue }) => {
  Vue.prototype.$events = events;
}
