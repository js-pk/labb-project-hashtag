export const common = {

  completeStage(stageNo) {
    const form = document.createElement('form');
    form.setAttribute('action', `/game/complete/${stageNo}`);
    form.setAttribute('method', 'GET');
    document.body.appendChild(form);
    form.submit();
  },

  showPopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
      common.disableBackgroundMovement();
      popup.style.pointerEvents = 'auto';
      popup.style.visibility = 'visible';
    }
  },

  hideAllPopup() {
    common.enableBackgroundMovement();
    const popups = document.getElementsByClassName('popup');
    for (const popup of popups) {
      popup.style.visibility = 'hidden';
    }
  },

  disableBackgroundMovement() {
    document.getElementById('container').style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.pointerEvents = 'none';
  },

  enableBackgroundMovement() {
    document.getElementById('container').style.overflow = 'scroll';
    document.body.style.overflow = 'scroll';
    document.body.style.pointerEvents = 'auto';
  },

  addPopup({
    popupId, title, content, imgURL, buttons,
  }, whilePopupVisible) {
    if (document.getElementById(popupId)) {
      document.getElementById(popupId).style.visibility = 'visible';
      return false;
    }

    common.disableBackgroundMovement();
    whilePopupVisible ? whilePopupVisible() : null;
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.id = popupId;
    popup.style.pointerEvents = 'auto';

    if (title) {
      const titleElement = document.createElement('h3');
      const titleText = document.createTextNode(title);
      titleElement.appendChild(titleText);
      popup.appendChild(titleElement);
    }
    if (content) {
      const contentElement = document.createElement('p');
      contentElement.classList.add('content');
      const contentText = document.createTextNode(content);
      contentElement.appendChild(contentText);
      popup.appendChild(contentElement);
    } else if (imgURL) {
      const img = document.createElement('img');
      img.classList.add('image');
      img.src = imgURL;
      popup.appendChild(img);
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    buttons.forEach((button) => {
      const buttonElement = document.createElement('button');
      const buttonText = document.createTextNode(button.title);
      buttonElement.appendChild(buttonText);
      buttonElement.onclick = button.onclick;
      buttonContainer.appendChild(buttonElement);
    });
    popup.appendChild(buttonContainer);

    document.body.appendChild(popup);
  },
};
