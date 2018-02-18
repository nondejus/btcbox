export interface BalanceRequest {
  coin: string;
}

export interface BalanceResponse {
  uid: number;
  nameauth: number;
  moflag: number;
  btc_balance: number;
  btc_lock: number;
  bch_balance: number;
  bch_lock: number;
  ltc_balance: number;
  ltc_lock: number;
  doge_balance: number;
  doge_lock: number;
  eth_balance: number;
  eth_lock: number;
  jpy_balance: number;
  jpy_lock: number;
}

export interface DepthResponse {
  asks: number[][];
  bids: number[][];
}

export interface CancelRequest {
  coin: string;
  id: string;
}

export interface CancelResponse {
  result: true;
  id: string;
}

export interface ErrorResponse {
  result: false;
  code: string;
}

export interface SendRequest {
  coin: string;
  amount: number;
  price: number;
  type: string;
}

export interface SendResponse {
  result: true;
  id: string;
}

export interface GetOrderRequest {
  coin: string;
  id: string;
}

export interface GetOrderResponse {
  id: number;
  datetime: string;
  type: string;
  price: number;
  amount_original: number;
  amount_outstanding: number;
  status: string;
}
