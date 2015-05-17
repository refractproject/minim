import 'mocha-sinon';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

// Configure mocking
chai.use(sinonChai);
const expect = chai.expect;

export {expect, sinon};
