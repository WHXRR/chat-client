import * as userAPI from './user'
import * as uploadAPI from './upload'
import * as loginAPI from './login'

export default {
	...userAPI,
  ...uploadAPI,
  ...loginAPI
}
