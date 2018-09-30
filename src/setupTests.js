import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import jestFetchMock from 'jest-fetch-mock';
import configureFa from './configureFa';

configureFa();
configure({ adapter: new Adapter() });
global.fetch = jestFetchMock;