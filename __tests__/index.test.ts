import * as index from '../lib/index';
import { BrokerConfigType, CashMarginType } from '../lib/types';

const brokerConfig: BrokerConfigType = {
  broker: 'Btcbox',
  enabled: true,
  maxLongPosition: 0.1,
  maxShortPosition: 0.1,
  key: 'key',
  secret: 'secret',
  cashMarginType: CashMarginType.Cash
};

test('create', () => {
  const ba = index.create(brokerConfig);
});