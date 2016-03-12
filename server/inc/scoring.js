/**
 * Created by dbakti7 on 3/12/2016.
 */
var CORRECT_FLAG_MULTIPLIER = 2, WRONG_FLAG_MULTIPLIER = 2,
    BOMB_EXPLODED_MULTIPLIER = -5, NEUTRAL_CLICK_MULTIPLIER = 0;


function calculateScore(correctFlags, wrongFlags, bombExploded, neutralClicks) {
    return CORRECT_FLAG_MULTIPLIER * correctFlags + NEUTRAL_CLICK_MULTIPLIER * neutralClicks +
            WRONG_FLAG_MULTIPLIER * wrongFlags + BOMB_EXPLODED_MULTIPLIER * bombExploded;
}
