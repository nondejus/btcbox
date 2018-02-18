import {
  BrokerAdapter,
  OrderStatus,
  OrderType,
  OrderSide,
  CashMarginType,
  QuoteSide,
  Order,
  Quote,
  BrokerConfigType
} from './types';
import * as _ from 'lodash';
import { getLogger } from '@bitr/logger';
import { eRound } from './util';
import BtcboxApi from './BtcboxApi';
import { SendRequest, DepthResponse } from './apiTypes';

export default class BrokerAdapterImpl implements BrokerAdapter {
  private readonly log = getLogger(`Btcbox.BrokerAdapter`);
  private readonly brokerApi: BtcboxApi;
  readonly broker = 'Btcbox';

  constructor(private readonly config: BrokerConfigType) {
    this.brokerApi = new BtcboxApi(this.config.key, this.config.secret);
    this.brokerApi.on('private_request', req =>
      this.log.debug(`Sending HTTP request... URL: ${req.url} Request: ${JSON.stringify(req)}`)
    );
    this.brokerApi.on('private_response', (response, request) =>
      this.log.debug(`Response from ${request.url}. Content: ${JSON.stringify(response)}`)
    );
  }

  async send(order: Order): Promise<void> {
    if (order.broker !== this.broker) {
      throw new Error();
    }

    const request = this.mapOrderToSendOrderRequest(order);
    const reply = await this.brokerApi.send(request);
    order.brokerOrderId = String(reply.id);
    order.status = OrderStatus.New;
    order.sentTime = new Date();
    order.lastUpdated = new Date();
  }

  async refresh(order: Order): Promise<void> {
    const orderId = order.brokerOrderId;
    const request = { coin: this.mapSymbolToCoin(order.symbol), id: orderId };
    const response = await this.brokerApi.getOrder(request);
    order.filledSize = eRound(response.amount_original - response.amount_outstanding);
    switch (response.status) {
      case 'cancelled':
        order.status = OrderStatus.Canceled;
        break;
      case 'all':
        order.status = OrderStatus.Filled;
        break;
    }
    order.lastUpdated = new Date();
    order.executions = [
      {
        broker: order.broker,
        brokerOrderId: order.brokerOrderId,
        cashMarginType: order.cashMarginType,
        side: order.side,
        symbol: order.symbol,
        size: order.filledSize,
        price: _.round(response.price),
        execTime: new Date(0)
      }
    ];
  }

  async cancel(order: Order): Promise<void> {
    const coin = this.mapSymbolToCoin(order.symbol);
    await this.brokerApi.cancel({ coin, id: order.brokerOrderId });
    order.lastUpdated = new Date();
    order.status = OrderStatus.Canceled;
  }

  async getBtcPosition(): Promise<number> {
    const btc = (await this.getPositions()).get('btc');
    if (btc === undefined) {
      throw new Error('Unable to find btc position.');
    }
    return btc;
  }

  async getPositions(): Promise<Map<string, number>> {
    const response = await this.brokerApi.getBalance({ coin: 'btc' });
    return new Map<string, number>([['btc', response.btc_balance], ['jpy', response.jpy_balance]]);
  }

  async fetchQuotes(): Promise<Quote[]> {
    const response = await this.brokerApi.getDepth();
    return this.mapToQuote(response);
  }

  private mapSymbolToCoin(symbol: string): string {
    let coin = '';
    switch (symbol) {
      case 'BTC/JPY':
        coin = 'btc';
        break;
      default:
        throw new Error('Not implemented.');
    }
    return coin;
  }

  private mapOrderToSendOrderRequest(order: Order): SendRequest {
    if (order.cashMarginType !== CashMarginType.Cash) {
      throw new Error('Not implemented.');
    }

    let coin = this.mapSymbolToCoin(order.symbol);
    let price = 0;
    switch (order.type) {
      case OrderType.Limit:
        price = order.price;
        break;
      default:
        throw new Error('Not implemented.');
    }

    return {
      price,
      coin,
      type: OrderSide[order.side].toLowerCase(),
      amount: order.size
    };
  }

  private mapToQuote(depth: DepthResponse): Quote[] {
    const asks = _(depth.asks)
      .take(100)
      .map(q => {
        return { broker: this.broker, side: QuoteSide.Ask, price: q[0], volume: q[1] };
      })
      .value();
    const bids = _(depth.bids)
      .take(100)
      .map(q => {
        return { broker: this.broker, side: QuoteSide.Bid, price: q[0], volume: q[1] };
      })
      .value();
    return _.concat(asks, bids);
  }
} /* istanbul ignore next */
