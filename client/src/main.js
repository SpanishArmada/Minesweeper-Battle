import { Minesweeper } from './Minesweeper.js';
document.addEventListener(
  'DOMContentLoaded',
  function () {
    document.getElementById('start').setAttribute('disabled', 'disabled');
    document.getElementById('start').textContent = 'Connecting to server ...';
    var minesweeper = new Minesweeper();
    minesweeper.drawMap();
    var afm = 0,
      afmGo = false,
      dots = '';
    function animateFindingMatch() {
      if (minesweeper.state.startMatch) {
        return;
      }
      afm++;
      if (afm % 40 === 0) {
        afm = 0;
        dots += '.';
      }
      if (dots.length > 5) {
        dots = '';
      }
      document.getElementById('message').textContent = 'Finding match' + dots;

      if (afmGo) {
        window.requestAnimationFrame(animateFindingMatch);
      } else {
        document.getElementById('message').textContent = '';
      }
    }
    document.getElementById('start').addEventListener(
      'click',
      function () {
        var usernameElem = document.getElementById('username-input');
        if (usernameElem.checkValidity()) {
          var username = usernameElem.value;
          // send findMatch
          minesweeper.start(username);

          afmGo = true;
          animateFindingMatch();
          document.getElementById('cancel').style.display = 'block';
          document.getElementById('start').style.display = 'none';
          document.getElementById('prompt').style.display = 'none';
        }
      },
      false
    );
    document.getElementById('cancel').addEventListener(
      'click',
      function () {
        // send cancelFindMatch
        minesweeper.cancel();

        afmGo = false;
        document.getElementById('message').textContent = '';
        document.getElementById('cancel').style.display = 'none';
        document.getElementById('start').style.display = 'block';
        document.getElementById('prompt').style.display = 'block';
      },
      false
    );
  },
  false
);
