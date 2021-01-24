$("#access-button").click(function () {
  var serverId = $("#server-id").val();
  var channelId = $("#channel-id").val();

  var serverTest = /^[0-9]{18}$/.test(serverId);
  var channelTest = /^[0-9]{18}$/.test(channelId);

  if (serverTest && channelTest) {
    window.open(
      `https://streamkit.discord.com/overlay/voice/${serverId}/${channelId}`
    );
  }
});

$(".label-list input").focusout(function (e) {
  var id = $(this).val();
  var isMatch = /^[0-9]{18}$/.test(id);

  if (id == "") {
    $(this).css("background-color", "#606060");
  } else if (isMatch) {
    $(this).css("background-color", "#305030");
  } else {
    $(this).css("background-color", "#603030");
  }
});
