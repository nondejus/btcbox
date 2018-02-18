// tslint:disable:max-line-length
import * as nock from 'nock';
import * as testData from './testData';

export function nocksetup() {
  const api = nock('https://www.btcbox.co.jp');
  api.get('/api/v1/depth/').reply(200, testData.depth);
  api.post('/api/v1/balance/').reply(200, testData.balance);
  api.post('/api/v1/balance/').reply(200, testData.balance);
  api.post('/api/v1/trade_cancel/').reply(200, testData.cancel);
  api.post('/api/v1/trade_add/').reply(200, testData.send);
  api.post('/api/v1/trade_view/').reply(200, testData.getOrder);
  api.post('/api/v1/trade_view/').reply(200, testData.getOrder2);
  api.post('/api/v1/trade_view/').reply(200, testData.getOrder3);
}