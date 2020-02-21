import gdrive from 'src/core/api/GoogleDrive'

export default ({ app, router, Vue }) => {
  Vue.prototype.$gdrive = gdrive;
}
