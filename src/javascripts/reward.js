import { common } from './common.js';

function exchangeReward() {
  const form = document.createElement('form');
  form.setAttribute('action', '/user/reward');
  form.setAttribute('method', 'POST');
  document.body.appendChild(form);
  form.submit();
}

function showExchangeRewardPopup() {
  let coinSound = new Howl({src: ['sound/coin.mp3']});
  coinSound.play();
  
  common.addPopup({
    popupId: 'reward',
    content: '교환 기회는 단 1번 입니다.\n\n 교환 버튼은 배급원만이 누를 수 있으며, 미리 누르게 되면 교환이 불가능 합니다.\n\n 지금 콘코인과 강냉이를 교환할까요?',
    buttons: [
      {
        title: '교환',
        onclick: () => {
          let yesSound = new Howl({src: ['/sound/yes.mp3']});
          yesSound.play();
          exchangeReward();
        }
      },
      {
        title: '취소',
        onclick: () => {
          let noSound = new Howl({src: ['/sound/no.mp3']});
          noSound.play();
          common.hideAllPopup();
        },
      },
    ],
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('exchange-reward')) {
    document.getElementById('exchange-reward').addEventListener('click', showExchangeRewardPopup);
  }
});
