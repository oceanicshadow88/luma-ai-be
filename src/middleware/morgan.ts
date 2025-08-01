import morgan from 'morgan';

import config from '../config';
import logger from '../utils/logger';

export default morgan(config.env === 'local' ? 'dev' : 'combined', {
  stream: {
    write: message => logger.info(message),
  },
});
