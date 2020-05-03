//@ts-check
/**
 * Created by dbakti7 on 3/12/2016.
 */
const CORRECT_FLAG_MULTIPLIER = 1;
const WRONG_FLAG_MULTIPLIER = -1;
const MINE_EXPLODED_MULTIPLIER = -5;
const NEUTRAL_CLICK_MULTIPLIER = 0;

/**
 * 
 * @param {number} correctFlags 
 * @param {number} wrongFlags 
 * @param {number} mineExploded 
 * @param {number} neutralClicks 
 */
function calculateScore(correctFlags, wrongFlags, mineExploded, neutralClicks) {
  return (
    CORRECT_FLAG_MULTIPLIER * correctFlags +
    NEUTRAL_CLICK_MULTIPLIER * neutralClicks +
    WRONG_FLAG_MULTIPLIER * wrongFlags +
    MINE_EXPLODED_MULTIPLIER * mineExploded
  );
}

module.exports = {
  CORRECT_FLAG_MULTIPLIER,
  WRONG_FLAG_MULTIPLIER,
  MINE_EXPLODED_MULTIPLIER,
  NEUTRAL_CLICK_MULTIPLIER,
  calculateScore,
};
