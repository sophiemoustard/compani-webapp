import features from '../api/Features'

export default ({ app, router, Vue }) => {
  Vue.prototype.$features = features;
}
