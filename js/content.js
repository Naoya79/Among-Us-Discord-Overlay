const url = chrome.extension.getURL("images/");
const colors = [
  "#3f484e",
  "#132fd2",
  "#72491e",
  "#39fedb",
  "#127f2d",
  "#50ef3a",
  "#ef7d0e",
  "#ed53b9",
  "#6b30bc",
  "#c51111",
  "#d5e0ef",
  "#f5f558",
];

/*----CSS読み込み----*/
function appendCSS(url) {
  $("body").append(`<link rel="stylesheet" href="${url}">`);
}
appendCSS("https://fonts.googleapis.com/icon?family=Material+Icons");
appendCSS(chrome.extension.getURL("css/style.css"));

/*----ツール要素追加----*/
$("body").prepend(`
  <div class="edit">
    <a class="button" id="edit-button">Lock</a>
    <a class="button" id="revert-button">Reset</a>
  </div>
`);
$("body").append(`
  <img id="map" src="${url}TheSkeld.png" ondragstart="return false;">
  <input class="menu-label" id="menu" type="checkbox" />
  <label class="open menu-label" for="menu">≡</label>
  <label class="back menu-label" for="menu"></label>
  <aside>
    <label for="menu" class="close">×</label>
    <div class="map-list">
      <a class="button map-button" id="TheSkeld">TheSkeld</a>
      <a class="button map-button" id="MiraHQ">MiraHQ</a>
      <a class="button map-button" id="Polus">Polus</a>
    </div>
    <nav>
      <div><i class="material-icons md-light">record_voice_over</i> Joined</div>
      <ul id="joined-ul"></ul>
      <div><i class="material-icons md-light transform">phone_disabled</i> Leaved</div>
      <ul id="leaved-ul"></ul>
    </nav>
    <table id="rule-table">
      <tr>
        <td>Emergency CD:</td>
        <td><input type="number" value="15" min="0" max="60" step="5"></td>
      </tr>
      <tr>
        <td>Kill Cooldown:</td>
        <td><input type="number" value="35.0" min="10.0" max="60.0" step="2.5"></td>
      </tr>
      <tr>
        <td>#Common Tasks:</td>
        <td><input type="number" value="2" min="0" max="2" step="1"></td>
      </tr>
      <tr>
        <td>#Long Tasks:</td>
        <td><input type="number" value="3" min="0" max="3" step="1"></td>
      </tr>
      <tr>
        <td>#Short Tasks:</td>
        <td><input type="number" value="5" min="0" max="5" step="1"></td>
      </tr>
    </table>
    <div id="crewmate-list">
      <img class="avatar" src="${url}playerIcons/3f484e.png" alt="#3f484e">
      <img class="avatar" src="${url}playerIcons/132fd2.png" alt="#132fd2">
      <img class="avatar" src="${url}playerIcons/72491e.png" alt="#72491e">
      <img class="avatar" src="${url}playerIcons/39fedb.png" alt="#39fedb">
      <img class="avatar" src="${url}playerIcons/127f2d.png" alt="#127f2d">
      <img class="avatar" src="${url}playerIcons/50ef3a.png" alt="#50ef3a">
      <img class="avatar" src="${url}playerIcons/ef7d0e.png" alt="#ef7d0e">
      <img class="avatar" src="${url}playerIcons/ed53b9.png" alt="#ed53b9">
      <img class="avatar" src="${url}playerIcons/6b30bc.png" alt="#6b30bc">
      <img class="avatar" src="${url}playerIcons/c51111.png" alt="#c51111">
      <img class="avatar" src="${url}playerIcons/d5e0ef.png" alt="#d5e0ef">
      <img class="avatar" src="${url}playerIcons/f5f558.png" alt="#f5f558">
    </div>
  </aside>
`);
$("body").children("*:not(aside, .menu-label)").wrapAll("<main></main>");

/*---- カラー編集切り替え ----*/
$("#edit-button").on("click", function () {
  const button = $(this).text();
  if (button == "Lock") {
    $(".voice-state").spectrum("disable");
    $(this).text("Unlock");
  } else {
    $(".voice-state").spectrum("enable");
    $(this).text("Lock");
  }
});

/*---- 初期位置 ----*/
$("#revert-button").on("click", function () {
  $(".voice-state").each(function (index, element) {
    $(element).css({
      position: "relative",
      left: "",
      top: "",
    });
  });
});

/*---- マップ切り替え ----*/
$(".map-button").on("click", function () {
  const buttonId = $(this).attr("id");
  const src = `${url}${buttonId}.png`;
  $(".map-button").each(function (index, element) {
    $(element).css({
      background: "#36393f",
      color: "#bbbbbb",
    });
  });
  $(this).css({
    background: "#a0a0a0",
    color: "white",
  });
  $("#map").attr("src", src);
});

/*----Discordユーザ取得----*/
const target = document.getElementById("app-mount");
const mutationObserver = new MutationObserver(callback);

function callback(mutations) {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if ($(node).hasClass("voice-state")) {
        userJoined(node);
      }
    });
    mutation.removedNodes.forEach((node) => {
      if ($(node).hasClass("voice-state")) {
        userLeaved(node);
      }
    });
  });
}
const option = {
  childList: true,
  subtree: true,
};
mutationObserver.observe(target, option);

/*----ユーザ参加時の設定----*/
function userJoined(node) {
  setCrewmate(node);
  setDraggable(node);
  setEmergencyButton(node);
  setColorPicker(node);
  setDeadSwitch(node);
}

/*----ユーザ退室時の設定----*/
function userLeaved(node) {
  // sidebar設定
  const id = $(node).attr("data-reactid");
  const joinedUser = $(`#joined-ul .side-vs[data-reactid='${id}']`);
  $("#leaved-ul").append(joinedUser);

  // crewmate-list設定
  const color = $(node).children(".avatar").attr("alt");
  const src = `${url}playerIcons/${color.substr(1)}.png`;
  if (colors.some((c) => c === color)) {
    $("#crewmate-list").append(
      `<img class="avatar" src="${src}" alt="${color}">`
    );
  }
}

/*----参加ユーザの初期設定----*/
function setCrewmate(node) {
  // sidebar設定
  const id = $(node).attr("data-reactid");
  const leavedUser = $(`#leaved-ul .side-vs[data-reactid='${id}']`);
  let color = "rgba(0, 0, 0, 0)";

  if (leavedUser.length != 0) {
    const oldColor = leavedUser.attr("alt");
    const joinedUser = $(`#joined-ul .side-vs[alt="${oldColor}"]`);
    if (joinedUser.length == 0) {
      color = oldColor;
    }
    leavedUser.remove();
  }

  const sideElement = $(node).clone().appendTo("#joined-ul");
  sideElement.attr("class", "side-vs");
  sideElement.find(".avatar").attr("class", "side-avatar");
  setElementColor(sideElement, color);

  // avatar設定
  if (colors.some((c) => c === color)) {
    $(node)
      .children(".avatar")
      .attr("src", `${url}playerIcons/${color.substr(1)}.png`);
    $(`#crewmate-list .avatar[alt='${color}']`).remove();
  }
  $(node).children(".avatar").attr("alt", color);
}

/*---- Draggable設定 ----*/
function setDraggable(node) {
  $(node).draggable({
    scroll: false,
    distance: 20,
    start: function () {
      $(node).spectrum("hide");
    },
    stop: function () {
      const pos = $(node).offset();
      $(node).css({
        position: "absolute",
        left: pos.left,
        top: pos.top,
      });
    },
  });
}

/*---- EmergencyButton設定 ----*/
function setEmergencyButton(node) {
  var button = $(
    `<img class="emergency-button" src="${url}EmergencyButton_close.png">`
  ).appendTo($(node).children(".user"));
  button.on("click", function () {
    var src = $(this).attr("src");
    if ($(this).css("filter") == "brightness(0.5)") {
      $(this).css("filter", "brightness(1.0)");
      src = src.replace("close", "open");
    } else {
      $(this).css("filter", "brightness(0.5)");
      src = src.replace("open", "close");
    }
    $(this).attr("src", src);
  });
}

/*----カラーパネルの設定----*/
function setColorPicker(node) {
  $(node).spectrum({
    showPalette: true,
    showPaletteOnly: true,
    palette: [
      ["#3f484e", "#132fd2", "#72491e", "#39fedb"],
      ["#127f2d", "#50ef3a", "#ef7d0e", "#ed53b9"],
      ["#6b30bc", "#c51111", "#d5e0ef", "#f5f558"],
    ],
    hideAfterPaletteSelect: true,
    clickoutFiresChange: false,

    show: function () {
      $(".sp-container").offset(function (index, coords) {
        return {
          top: coords.top + 13,
          left: coords.left - 8,
        };
      });
    },

    move: function (color) {
      const oldElement = $(node).children(".avatar");
      const oldColor = oldElement.attr("alt");
      const oldSrc = `${url}playerIcons/${oldColor.substr(1)}.png`;
      const oldJoinedUser = $(
        `#joined-ul .side-vs[data-reactid='${$(node).attr("data-reactid")}']`
      );
      const newColor = color.toHexString();
      const newSrc = `${url}playerIcons/${color.toHex()}.png`;
      const newElement = $(`.avatar[alt='${newColor}']`);
      const newJoinedUser = $(
        `#joined-ul .side-vs[data-reactid='${newElement
          .parent()
          .attr("data-reactid")}']`
      );

      if (colors.some((c) => c === newColor) && oldColor != newColor) {
        // 選択したカラーをスワップ
        if (colors.some((c) => c === oldColor)) {
          // 元がユーザ画像ではない
          newElement.attr({
            src: oldSrc,
            alt: oldColor,
          });
          setElementColor(newJoinedUser, oldColor);
        } else {
          // 元がユーザ画像
          if (newElement.hasClass("avatar")) {
            // 他のユーザが対象
            const subElement = $("#crewmate-list .avatar:first");
            const subColor = subElement.attr("alt");
            const subSrc = `${url}playerIcons/${subColor.substr(1)}.png`;

            newElement.attr({
              src: subSrc,
              alt: subColor,
            });
            setElementColor(newJoinedUser, subColor);
            subElement.remove();
          } else {
            // クルーリストが対象
            newElement.remove();
          }
        }
        // 選択したカラーをボタンに追加
        oldElement.attr({
          src: newSrc,
          alt: newColor,
        });
        setElementColor(oldJoinedUser, newColor);
      }
    },
  });
}

/*---- 死体切り替え ----*/
function setDeadSwitch(node) {
  $(node).dblclick(function () {
    const crew = $(node).children(".avatar");
    var color = crew.attr("alt");
    if (color) {
      color = color.substr(1);
      var src = crew.attr("src").replace(color + "-dead", color);
      if (src == crew.attr("src")) {
        src = crew.attr("src").replace(color, color + "-dead");
      }
      crew.attr("src", src);
    }
  });
}

/*---- サイドバーのユーザの色設定 ----*/
function setElementColor(element, color) {
  element.attr("alt", color);
  element.css("background-color", color);
}
