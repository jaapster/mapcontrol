export const vec2 = {
	rotate([x, y], radians) {
		return [
			x * Math.cos(radians) - y * Math.sin(radians),
			x * Math.sin(radians) + y * Math.cos(radians)
		];
	},

	mult([x, y], factor) {
		if (typeof factor === 'number') {
			return [
				x * factor,
				y * factor
			];
		}
		return [
			x * factor[0],
			y * factor[1]
		];
	},

	div([x, y], factor) {
		if (typeof factor === 'number') {
			return [
				x / factor,
				y / factor
			];
		}
		return [
			x / factor[0],
			y / factor[1]
		];
	},

	add([x1, y1], [x2, y2]) {
		return [
			x1 + x2,
			y1 + y2
		];
	}
}
