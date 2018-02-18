import * as testData from './testData';
import BrokerAdapter from '../lib/BrokerAdapterImpl';
import { BrokerConfigType, CashMarginType, Broker, OrderSide, OrderType, TimeInForce, OrderStatus } from '../lib/types';
import * as nock from 'nock';
import { nocksetup } from './nocksetup';

function createOrder(
  broker: Broker,
  side: OrderSide,
  size: number,
  price: number,
  cashMarginType: CashMarginType,
  type: OrderType,
  leverageLevel: number
) {
  return {
    broker,
    side,
    size,
    price,
    cashMarginType,
    type,
    leverageLevel,
    symbol: 'BTC/JPY',
    timeInForce: TimeInForce.None
  };
}

const brokerConfig: BrokerConfigType = {
  broker: 'Btcbox',
  enabled: true,
  maxLongPosition: 0.1,
  maxShortPosition: 0.1,
  key: 'key',
  secret: 'secret',
  cashMarginType: CashMarginType.Cash
};

describe('BtcboxBrokerAdapter', () => {
  beforeAll(() => {
    nocksetup();
  });

  afterAll(() => {
    nock.restore();
  });

  test('fetchQuotes', async () => {
    const ba = new BrokerAdapter(brokerConfig);
    const quotes = await ba.fetchQuotes();
    expect(quotes).toEqual([
      { broker: 'Btcbox', price: 1200000, side: 'Ask', volume: 4.217 },
      { broker: 'Btcbox', price: 1199999, side: 'Ask', volume: 0.17 },
      { broker: 'Btcbox', price: 1199481, side: 'Ask', volume: 0.004 },
      { broker: 'Btcbox', price: 1198625, side: 'Bid', volume: 0.001 },
      { broker: 'Btcbox', price: 1197707, side: 'Bid', volume: 0.005 },
      { broker: 'Btcbox', price: 1196306, side: 'Bid', volume: 0.4869 }
    ]);
  });

  test('send', async () => {
    const ba = new BrokerAdapter(brokerConfig);
    const order = createOrder('Btcbox', OrderSide.Buy, 0.001, 900000, CashMarginType.Cash, OrderType.Limit, undefined);
    await ba.send(order);
    expect(order.brokerOrderId).toBe('12345');
  });

  test('cancel', async () => {
    const ba = new BrokerAdapter(brokerConfig);
    const order = createOrder('Btcbox', OrderSide.Buy, 0.001, 900000, CashMarginType.Cash, OrderType.Limit, undefined);
    order.brokerOrderId = '12345';
    await ba.cancel(order);
    expect(order.brokerOrderId).toBe('12345');
    expect(order.status).toBe(OrderStatus.Canceled);
  });

  test('positions', async () => {
    const ba = new BrokerAdapter(brokerConfig);
    const pos = await ba.getPositions();
    expect(pos.get('btc')).toBe(0);
    expect(pos.get('jpy')).toBe(100);
  });

  test('btc positions', async () => {
    const ba = new BrokerAdapter(brokerConfig);
    const pos = await ba.getBtcPosition();
    expect(pos).toBe(0);
  });

  test('refresh', async () => {
    const ba = new BrokerAdapter(brokerConfig);
    const order = createOrder('Btcbox', OrderSide.Buy, 0.001, 900000, CashMarginType.Cash, OrderType.Limit, undefined);
    order.brokerOrderId = '12345';
    order.status = OrderStatus.New;
    await ba.refresh(order);
    expect(order.brokerOrderId).toBe('12345');
    expect(order.status).toBe(OrderStatus.New);
  });

  test('refresh, cancelled', async () => {
    const ba = new BrokerAdapter(brokerConfig);
    const order = createOrder('Btcbox', OrderSide.Buy, 0.001, 900000, CashMarginType.Cash, OrderType.Limit, undefined);
    order.brokerOrderId = '12345';
    order.status = OrderStatus.New;
    await ba.refresh(order);
    expect(order.brokerOrderId).toBe('12345');
    expect(order.status).toBe(OrderStatus.Canceled);
  });

  test('refresh, filled', async () => {
    const ba = new BrokerAdapter(brokerConfig);
    const order = createOrder('Btcbox', OrderSide.Buy, 0.001, 900000, CashMarginType.Cash, OrderType.Limit, undefined);
    order.brokerOrderId = '12345';
    order.status = OrderStatus.New;
    await ba.refresh(order);
    expect(order.brokerOrderId).toBe('12345');
    expect(order.status).toBe(OrderStatus.Filled);
  });

  test('send wrong cashMarginType', async () => {
    const ba = new BrokerAdapter(brokerConfig);
    const order = { broker: 'Btcbox', cashMarginType: CashMarginType.MarginOpen, symbol: 'BTC/JPY' };
    try {
      await ba.send(order);
    } catch (ex) {
      return;
    }
    expect(false).toBe(true);
  });

  test('send wrong symbol', async () => {
    const ba = new BrokerAdapter(brokerConfig);
    const order = { broker: 'Btcbox', cashMarginType: CashMarginType.Cash, symbol: 'ZZZ/YYY' };
    try {
      await ba.send(order);
    } catch (ex) {
      return;
    }
    expect(false).toBe(true);
  });

  test('send market, not supported', async () => {
    const ba = new BrokerAdapter(brokerConfig);
    const order = { broker: 'Btcbox', cashMarginType: CashMarginType.Cash, symbol: 'BTC/JPY', type: OrderType.Market };
    try {
      await ba.send(order);
    } catch (ex) {
      return;
    }
    expect(false).toBe(true);
  });
});
