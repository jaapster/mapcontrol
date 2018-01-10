export const mat3 = {
	translation: function(tx, ty) {
		return [
			1, 0, 0,
			0, 1, 0,
			tx, ty, 1
		];
	},

	rotation: function(angleInRadians) {
		const c = Math.cos(angleInRadians);
		const s = Math.sin(angleInRadians);
		return [
			c,-s, 0,
			s, c, 0,
			0, 0, 1
		];
	},

	scaling: function(sx, sy) {
		return [
			sx, 0, 0,
			0, sy, 0,
			0, 0, 1
		];
	},

	identity: function() {
		return [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		]
	}
};
