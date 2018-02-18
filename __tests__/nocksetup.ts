// tslint:disable:max-line-length
import * as nock from 'nock';
import * as testdata from './testdata';

export function nocksetup() {
  const api = nock('https://www.btcbox.co.jp');
  api.get('/api/v1/depth/').reply(200, testdata.depth);
  api.post('/api/v1/balance/').reply(200, testdata.balance);
  api.post('/api/v1/balance/').reply(200, testdata.balance);
  api.post('/api/v1/trade_cancel/').reply(200, testdata.cancel);
  api.post('/api/v1/trade_add/').reply(200, testdata.send);
  api.post('/api/v1/trade_view/').reply(200, testdata.getOrder);
  api.post('/api/v1/trade_view/').reply(200, testdata.getOrder2);
  api.post('/api/v1/trade_view/').reply(200, testdata.getOrder3);
}