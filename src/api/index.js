import * as userAPI from './user'
import * as uploadAPI from './upload'

export default {
	...userAPI,
  ...uploadAPI
}
