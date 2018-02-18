export const balance =
  '{"uid":12345,"nameauth":1,"moflag":1,"btc_balance":0,"btc_lock":0,"bch_balance":0,"bch_lock":0,"ltc_balance":0,"ltc_lock":0,"doge_balance":0,"doge_lock":0,"eth_balance":0,"eth_lock":0,"jpy_balance":100,"jpy_lock":0}';

export const send = '{"result":true,"id":"12345"}';
export const cancel = '{"result":true,"id":"12345"}';
export const error = '{"result":false,"code":"401"}';
export const getOrder =
  '{"id":12345,"datetime":"2018-02-18 09:30:24","type":"buy","price":900000,"amount_original":0.001,"amount_outstanding":0.001,"status":"part"}';
  export const getOrder2 =
  '{"id":12345,"datetime":"2018-02-18 09:30:24","type":"buy","price":900000,"amount_original":0.001,"amount_outstanding":0.001,"status":"cancelled"}';
  export const getOrder3 =
  '{"id":12345,"datetime":"2018-02-18 09:30:24","type":"buy","price":900000,"amount_original":0.001,"amount_outstanding":0,"status":"all"}';
export const depth =
  '{"asks":[[1200000,4.217],[1199999,0.17],[1199481,0.004]],"bids":[[1198625,0.001],[1197707,0.005],[1196306,0.4869]]}';
