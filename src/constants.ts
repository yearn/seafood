import {FixedNumber} from 'ethers';

const HOURS_IN_A_YEAR = FixedNumber.from(24 * 365);
const BPS = FixedNumber.from(10_000);
const ONE = FixedNumber.from(1);

export {
	HOURS_IN_A_YEAR,
	BPS,
	ONE
};
