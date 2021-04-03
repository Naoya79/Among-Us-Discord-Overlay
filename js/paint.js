// css
appendCSS(chrome.extension.getURL("css/paint.css"));

// html
let colorElement = "";
CREW_COLORS.forEach(function (value) {
  const className = value.substr(1);
  colorElement += `<a class="${className}" data-color="${value}" style="background-color: ${value};"></a>`;
});
$("body").append(`
<canvas id="canvas"></canvas>

<div class="accordion-box-side row">
  <p class="accordion-side" data-state="brush">
    <i class="material-icons menu-button" id="brush">brush</i>
    <i class="material-icons menu-button" id="close">close</i>
  </p>
  <div class="accordion-content-side">
    <i class="material-icons" id="clear">delete</i>
    <i class="material-icons" id="undo">undo</i>
    <i class="material-icons" id="redo">redo</i>
    <div class="color">${colorElement}</div>
    <a id="bold" data-bold="5"></a>
  </div>
</div>
`);

// canvas初期設定
const canvas = new fabric.Canvas("canvas", {
  isDrawingMode: false,
  selection: false,
});
canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
canvas.freeDrawingBrush.color = "#39fedb";
canvas.freeDrawingBrush.width = 5;
canvas.hoverCursor = "default";
fabric.Object.prototype.selectable = false;

// キャンバスサイズのレスポンシブ対応
$(window).resize(canvas_resize);
function canvas_resize() {
  canvas.setDimensions({
    width: $(window).width(),
    height: $(window).height(),
  });
}
canvas_resize();

// キャンバス履歴対応
var canvasHistory = [];
var isRedoing = false;
canvas.on("object:added", (e) => {
  const object = e.target;
  if (!isRedoing) {
    canvasHistory = [];
  }
  isRedoing = false;
});

// 色の変更
$(".color a").click(function () {
  const color = $(this).data("color");
  setBrushColor(color);
});
function setBrushColor(color) {
  canvas.freeDrawingBrush.color = color;
  $("#bold").css("background-color", color);
}

// 線の太さ変更
$("#bold").click(function () {
  const bold = $(this).data("bold");
  const newBold = bold === 1 ? 5 : bold === 5 ? 10 : bold === 10 ? 1 : 5;
  $(this).data("bold", newBold);
  canvas.freeDrawingBrush.width = newBold;
  const w = 8 - 0.5 * newBold;
  $("#bold").css("box-shadow", `0 0 0 ${w}px #777777 inset`);
});

// 描画クリア
$("#clear").click(function () {
  canvas.clear();
});

// 戻る
$("#undo").click(function () {
  if (canvas._objects.length > 0) {
    const undoObject = canvas._objects.pop();
    canvasHistory.push(undoObject);
    canvas.renderAll();
  }
});

// 進む
$("#redo").click(function () {
  if (canvasHistory.length > 0) {
    isRedoing = true;
    const redoObject = canvasHistory.pop();
    canvas.add(redoObject);
  }
});

// ペイントメニュー開閉
$(".accordion-side").click(function () {
  $(this).next().animate({ width: "toggle" }, "fast");
  $(this).next().css("display", "flex");
  const state = $(this).data("state");
  if (state === "brush") {
    $(this).data("state", "close");
    canvas.isDrawingMode = true;
    $("#brush").css({
      animation: "clockwise 0.4s forwards, fadeout 0.4s forwards",
    });
    $("#close").css({
      animation: "clockwise 0.4s forwards, fadein 0.4s forwards",
    });
  } else if (state === "close") {
    $(this).data("state", "brush");
    canvas.isDrawingMode = false;
    $("#close").css({
      animation: "anticlockwise 0.4s forwards, fadeout 0.4s forwards",
    });
    $("#brush").css({
      animation: "anticlockwise 0.4s forwards, fadein 0.4s forwards",
    });
  }
});
