import config from '@src/config';
import logger from '@src/utils/logger';
import morgan from 'morgan';

export default morgan(config.env === 'development' ? 'dev' : 'combined', {
  stream: {
    write: message => logger.info(message),
  },
});
