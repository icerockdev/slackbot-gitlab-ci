var Botkit = require('botkit')

var token = process.env.SLACK_TOKEN

var controller = Botkit.slackbot({
    // reconnect to Slack RTM when connection goes bad
    retry: Infinity,
    debug: false
})

// Assume single team mode if we have a SLACK_TOKEN
if (token) {
    console.log('Starting in single-team mode')

    controller.spawn({
        token: token,
        retry: Infinity
    }).startRTM(function (err, bot, payload) {
        if (err) {
            throw new Error(err)
        }

        console.log('Connected to Slack RTM')
    })
// Otherwise assume multi-team mode - setup beep boop resourcer connection
} else {
    console.log('Starting in Beep Boop multi-team mode')
    require('beepboop-botkit').start(controller, {debug: true})
}

controller.hears('build', ['direct_message', 'direct_mention'], function (bot, message) {
    // TODO start gitlab build
    bot.reply(message, "i hear you")
})

controller.hears('help', ['direct_message', 'direct_mention'], function (bot, message) {
    var help = 'I will respond to the following messages: \n' +
        '`help` to see this again.\n' +
        '`build <project-namespace>/<project-name> <ref> <env-name>=<env-value>,<env2-name>=<env2-value>,<bool-env-name>` for a start build.'
    bot.reply(message, help)
})
