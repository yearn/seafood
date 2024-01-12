const {BigNumber} = require('ethers');
const utils = require('./utils');

describe('Utils', () => {
  test('Formats 1 token', function() {
    const decimals = BigNumber.from('18');
    const tokens = BigNumber.from('1' + '0'.repeat(decimals));
    const result = utils.formatTokens(tokens, decimals);
    expect(result).toBe('1.00');
  })

  test('Formats bps', function() {
    const result = utils.formatBps(3 / 10_000);
    expect(result).toBe('3bps');
  })

  test.only('converts block time to Date', function() {
    expect(utils.blocktimeToDate('1705083313n')).toStrictEqual(new Date('2024-01-12T18:15:13.000Z'));
    expect(utils.blocktimeToDate('1705083313')).toStrictEqual(new Date('2024-01-12T18:15:13.000Z'));
  })
})