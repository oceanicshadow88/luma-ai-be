import morgan from 'morgan';
import config from '../config';
import logger from '../utils/logger';

export default morgan(config.env === 'development' ? 'dev' : 'combined', {
  stream: {
    write: message => logger.info(message),
  },
});
