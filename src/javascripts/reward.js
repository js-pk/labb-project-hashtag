import { common } from './common.js';

function exchangeReward() {
    let form = document.createElement('form');
    form.setAttribute('action', `/user/reward`);
    form.setAttribute('method', 'POST');
    document.body.appendChild(form);
    form.submit();
}

function showExchangeRewardPopup() {
    common.addPopup({
        popupId: "reward",
        content: "교환 기회는 단 1번 입니다.\n\n 교환 버튼은 배급원만이 누를 수 있으며, 미리 누르게 되면 교환이 불가능 합니다.\n\n 지금 콘코인과 강냉이를 교환할까요?",
        buttons: [
            {
                title: "교환",
                onclick: exchangeReward
            },
            {
                title: "취소",
                onclick: common.hideAllPopup
            }
        ]
    })
};

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("exchange-reward").addEventListener("click", showExchangeRewardPopup)
})
