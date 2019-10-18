import gdrive from '../api/GoogleDrive'

export default ({ app, router, Vue }) => {
  Vue.prototype.$gdrive = gdrive;
}
