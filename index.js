var Botkit = require('botkit')

var token = process.env.SLACK_TOKEN
var gitLabUrl = process.env.GITLAB_URL
var gitLabToken = process.env.GITLAB_TOKEN

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

const GitLabSlackCommands = require('./commands/GitLabSlackCommands')

new GitLabSlackCommands(controller, gitLabUrl, gitLabToken)
