/**
 * Created by dbakti7 on 3/12/2016.
 */

module.exports = (function () {
	var CORRECT_FLAG_MULTIPLIER = 1,
		WRONG_FLAG_MULTIPLIER = -1,
		MINE_EXPLODED_MULTIPLIER = -5,
		NEUTRAL_CLICK_MULTIPLIER = 0;

	function calculateScore(correctFlags, wrongFlags, mineExploded, neutralClicks) {
		return CORRECT_FLAG_MULTIPLIER * correctFlags + NEUTRAL_CLICK_MULTIPLIER * neutralClicks +
			WRONG_FLAG_MULTIPLIER * wrongFlags + MINE_EXPLODED_MULTIPLIER * mineExploded;
	}

	return {
		CORRECT_FLAG_MULTIPLIER: CORRECT_FLAG_MULTIPLIER,
		WRONG_FLAG_MULTIPLIER: WRONG_FLAG_MULTIPLIER,
		MINE_EXPLODED_MULTIPLIER: MINE_EXPLODED_MULTIPLIER,
		NEUTRAL_CLICK_MULTIPLIER: NEUTRAL_CLICK_MULTIPLIER,
		calculateScore: calculateScore
	}
}());

