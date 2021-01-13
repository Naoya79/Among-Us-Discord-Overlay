var url = chrome.extension.getURL('images/');

/*----CSS読み込み----*/
function appendCSS(url) {
  $('body').append(`<link rel="stylesheet" href="${url}">`);
}
appendCSS(chrome.extension.getURL('css/style.css'));

/*----ツール要素追加----*/
$('body').prepend(
  `<input class="menu-label" id="menu" type="checkbox" />
  <label class="open menu-label" for="menu">≡</label>
  <label class="back menu-label" for="menu"></label>
  <aside>
    <label for="menu" class="close">×</label>
    <nav>
      Joined
      <ul>
        <li>list1</li>
        <li>list2</li>
      </ul>
      Leaved
      <ul>
        <li>list3</li>
        <li>list4</li>
      </ul>
    </nav>
    <div id="crewmate-list">
      <img class="crewmates" src="${url}playerIcons/3f484e.png" alt="#3f484e">
      <img class="crewmates" src="${url}playerIcons/132fd2.png" alt="#132fd2">
      <img class="crewmates" src="${url}playerIcons/72491e.png" alt="#72491e">
      <img class="crewmates" src="${url}playerIcons/39fedb.png" alt="#39fedb">
      <img class="crewmates" src="${url}playerIcons/127f2d.png" alt="#127f2d">
      <img class="crewmates" src="${url}playerIcons/50ef3a.png" alt="#50ef3a">
      <img class="crewmates" src="${url}playerIcons/ef7d0e.png" alt="#ef7d0e">
      <img class="crewmates" src="${url}playerIcons/ed53b9.png" alt="#ed53b9">
      <img class="crewmates" src="${url}playerIcons/6b30bc.png" alt="#6b30bc">
      <img class="crewmates" src="${url}playerIcons/c51111.png" alt="#c51111">
      <img class="crewmates" src="${url}playerIcons/d5e0ef.png" alt="#d5e0ef">
      <img class="crewmates" src="${url}playerIcons/f5f558.png" alt="#f5f558">
    </div>
  </aside>
  <div class="edit">
    <a class="button" id="edit-button">Lock</a>
    <a class="button" id="revert-button">Reset</a>
  </div>`
);
$('body').append(
  `<div class="map-list">
    <a class="button map-button" id="TheSkeld">TheSkeld</a>
    <a class="button map-button" id="MiraHQ">MiraHQ</a>
    <a class="button map-button" id="Polus">Polus</a>
  </div>
  <img id="map" src="${url}TheSkeld.png" ondragstart="return false;">`
);
$('body').children('*:not(aside, .menu-label)').wrapAll('<main></main>')

/*---- カラー編集切り替え ----*/
$('#edit-button').on('click', function() {
  const button = $(this).text();
  if (button == 'Lock') {
    $('.voice-state').spectrum('disable');
    $(this).text('Unlock');
  } else {
    $('.voice-state').spectrum('enable');
    $(this).text('Lock');
  }
});

/*---- 初期位置 ----*/
$('#revert-button').on('click', function() {
  $('.voice-state').each(function(index, element) {
    $(element).css({
      'position': 'block',
      'left': '',
      'top': ''
    });
    $(element).css({
      'position': 'relative'
    });
  });
});

/*---- マップ切り替え ----*/
$('.map-button').on('click', function() {
  const buttonId = $(this).attr('id');
  const src = `${url}${buttonId}.png`;
  $('.map-button').each(function(index, element){
    $(element).css({
      'background': 'none',
      'color': '#bbbbbb'
    });
  });
  $(this).css({
    'background': '#a0a0a0',
    'color': 'white'
  });
  $('#map').attr('src', src);
});

/*----Discordユーザ取得----*/
const target = document.getElementById('app-mount')
const mutationObserver = new MutationObserver(callback);

function callback(mutations) {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if ($(node).hasClass('voice-state')) {
        userJoined(node);
      }
    });
    mutation.removedNodes.forEach(node => {
      if ($(node).hasClass('voice-state')) {
        userLeaved(node);
      }
    });
  });
}
const option = {
  childList: true,
  subtree: true
};
mutationObserver.observe(target, option);

/*----ユーザ参加時の設定----*/
function userJoined(node) {
  $(node).draggable({
    scroll: false,
    distance: 20,
    start: function() {
      $(node).spectrum('hide');
    },
    stop: function() {
      const pos = $(node).offset();
      $(node).css({
        'position': 'absolute',
        'left': pos.left,
        'top': pos.top
      });
    }
  });
  $(node).children('.avatar').addClass('crewmates');
  $(node).children('.avatar').attr('alt', '#ffffff');
  setEmergencyButton(node);
  //setCrewmate(node);
  setColorPicker(node);
  setDeadSwitch(node);
}

/*----ユーザ退室時の設定----*/
function userLeaved(node) {
  const color = $(node).children('.avatar').attr('alt');
  const src = `${url}playerIcons/${color.substr(1)}.png`;
  if (colors.some(c => c === color)) {
    $('#crewmate-list').append(`<img class="crewmates" src="${src}" alt="${color}">`);
  }
}

/*---- EmergencyButton設定 ----*/
function setEmergencyButton(node) {
  var button = $(`<img class="emergency-button" src="${url}EmergencyButton_close.png">`).appendTo($(node).children('.user'));
  button.on('click', function() {
    var src = $(this).attr('src');
    if ($(this).css('filter') == 'brightness(0.5)') {
      $(this).css('filter', 'brightness(1.0)');
      src = src.replace('close', 'open');
    } else {
      $(this).css('filter', 'brightness(0.5)');
      src = src.replace('open', 'close');
    }
    $(this).attr('src', src);
  });
}

/*----参加ユーザにクルーメイトを設定----*/
function setCrewmate(node) {
  const avatar = $(node).children('.avatar');
  const subElement = $('#crewmate-list .crewmates:first');
  const subColor = subElement.attr('alt');
  const subSrc = `${url}playerIcons/${subColor.substr(1)}.png`;

  avatar.attr({
    'src': subSrc,
    'alt': subColor
  });
  subElement.remove();
}

/*----カラーパネルの設定----*/
const colors = ['#3f484e', '#132fd2', '#72491e', '#39fedb', '#127f2d', '#50ef3a', '#ef7d0e', '#ed53b9', '#6b30bc', '#c51111', '#d5e0ef', '#f5f558'];

function setColorPicker(node) {
  $(node).spectrum({
    showPalette: true,
    showPaletteOnly: true,
    palette: [
      ['#3f484e', '#132fd2', '#72491e', '#39fedb'],
      ['#127f2d', '#50ef3a', '#ef7d0e', '#ed53b9'],
      ['#6b30bc', '#c51111', '#d5e0ef', '#f5f558']
    ],
    hideAfterPaletteSelect: true,
    clickoutFiresChange: false,

    show: function() {
      $('.sp-container').offset(function(index, coords) {
        return {
          top: coords.top + 13,
          left: coords.left - 8
        }
      });
    },

    move: function(color) {
      const oldElement = $(node).children('.avatar');
      const oldColor = oldElement.attr('alt');
      const oldSrc = `${url}playerIcons/${oldColor.substr(1)}.png`;
      const newColor = color.toHexString();
      const newSrc = `${url}playerIcons/${color.toHex()}.png`;
      const newElement = $(`.crewmates[alt='${newColor}']`);

      if (colors.some(c => c === newColor) && oldColor != newColor) {
        // 選択したカラーをスワップ
        if (colors.some(c => c === oldColor)) { // 元がユーザ画像ではない
          newElement.attr({
            'src': oldSrc,
            'alt': oldColor
          });
        } else { // 元がユーザ画像
          if (newElement.hasClass('avatar')) { // 他のユーザが対象
            const subElement = $('#crewmate-list .crewmates:first');
            const subColor = subElement.attr('alt');
            const subSrc = `${url}playerIcons/${subColor.substr(1)}.png`;

            newElement.attr({
              'src': subSrc,
              'alt': subColor
            });
            subElement.remove();
          } else { // クルーリストが対象
            newElement.remove();
          }
        }
        // 選択したカラーをボタンに追加
        oldElement.attr({
          'src': newSrc,
          'alt': newColor
        });
      }
    }
  });
}

/*---- 死体切り替え ----*/
function setDeadSwitch(node) {
  $(node).dblclick(function() {
    const crew = $(node).children('.avatar')
    var color = crew.attr('alt');
    if (color) {
      color = color.substr(1);
      var src = crew.attr('src').replace(color + '-dead', color);
      if (src == crew.attr('src')) {
        src = crew.attr('src').replace(color, color + '-dead');
      }
      crew.attr('src', src);
    }
  });
}
