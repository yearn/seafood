const {bisectLeft, nearestNeighbor} = require('./nearestNeighbor');

describe('Utils', () => {
	test('Bisects', function() {
		expect(bisectLeft([1, 2, 4], 1)).toBe(0);
		expect(bisectLeft([1, 2, 4], 2)).toBe(1);
		expect(bisectLeft([1, 2, 4], 3)).toBe(2);
		expect(bisectLeft([1, 2, 4], 4)).toBe(2);
		expect(bisectLeft([1, 2, 4], 5)).toBe(3);
	});

	test('Finds nearest neighbor', function() {
		expect(nearestNeighbor([1, 2, 5], -100)).toBe(1);
		expect(nearestNeighbor([1, 2, 5], -1)).toBe(1);
		expect(nearestNeighbor([1, 2, 5], 1)).toBe(1);
		expect(nearestNeighbor([1, 2, 5], 2)).toBe(2);
		expect(nearestNeighbor([1, 2, 5], 3)).toBe(2);
		expect(nearestNeighbor([1, 2, 5], 4)).toBe(5);
		expect(nearestNeighbor([1, 2, 5], 5)).toBe(5);
		expect(nearestNeighbor([1, 2, 5], 6)).toBe(5);
		expect(nearestNeighbor([1, 2, 5], 100)).toBe(5);
	});
});