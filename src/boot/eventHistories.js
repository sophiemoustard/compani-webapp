import eventHistories from '../api/EventHistories';

export default ({ app, router, Vue }) => {
  Vue.prototype.$eventHistories = eventHistories;
}
