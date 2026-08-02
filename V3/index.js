const { findByProps } = require("@vendetta/metro");
const { registerCommand } = require("@vendetta/commands");
const { showToast } = require("@vendetta/ui/toasts");

let unregisterCommand;

const RestAPI = findByProps("getAPIBaseURL", "get", "post");
const MessageActions = findByProps("jumpToMessage");

async function jumpToLatestPing() {
  try {
    const res = await RestAPI.get({
      url: "/users/@me/mentions",
      query: {
        limit: 1,
        roles: true,
        everyone: true,
      },
    });

    const mention = res && res.body && res.body[0];
    if (!mention) {
      showToast("No recent pings found.");
      return;
    }

    await MessageActions.jumpToMessage({
      channelId: mention.channel_id,
      messageId: mention.id,
      isPreload: false,
    });
  } catch (e) {
    showToast("Couldn't jump to your latest ping — see console for details.");
    console.error("[GoToPing] failed:", e);
  }
}

module.exports = {
  onLoad: function () {
    unregisterCommand = registerCommand({
      name: "goto-ping",
      displayName: "goto-ping",
      description: "Jump to your most recent ping/mention",
      displayDescription: "Jump to your most recent ping/mention",
      type: 1,
      inputType: 1,
      applicationId: "-1",
      execute: async function (_args, _ctx) {
        await jumpToLatestPing();
        return {
          send: false,
        };
      },
    });
  },
  onUnload: function () {
    if (unregisterCommand) unregisterCommand();
  },
};

