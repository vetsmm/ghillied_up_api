import { ConfigurationType } from './types';

export default (): ConfigurationType => {
    switch (process.env.APP_ENV || 'DEV') {
        case 'DEV':
            return require('./dev.configuration').default();
        case 'QA':
            return require('./qa.configuration').default();
        case 'PROD':
            return require('./prod.configuration').default();
    }
}
