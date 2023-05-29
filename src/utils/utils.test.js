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
})