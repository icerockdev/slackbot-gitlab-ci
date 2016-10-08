/**
 * Created by Алексей on 29-Jun-16.
 */

const CommandManager = require('./CommandManager')
const Command = require('./Command')
const GitLabRequests = require('../GitLabRequests')

const buildUsageHelp = "`build <project-namespace>/<project-name> <ref> <env-name>=<env-value> <env2-name>=<env2-value> <bool-env-name>`"

module.exports = function (controller, _gitLabUrl, _gitLabToken) {
    this.controller = controller
    this.gitLabRequests = new GitLabRequests(_gitLabUrl, _gitLabToken)

    var self = this

    init()
    function init() {
        var buildCmd = new Command('build', buildHandler)
        var helpCmd = new Command('help', helpHandler)

        var commandManager = new CommandManager()
        commandManager.addCommand(buildCmd)
        commandManager.addCommand(helpCmd)

        self.controller.on(['direct_message', 'direct_mention'], function (bot, message) {
            var argv = message.text.split(" ")
            commandManager.exec(argv, {"bot": bot, "message": message})
        })
    }

    function buildHandler(argv, context) {
        console.log("build arg: %s, bot: %s, message: %s", argv, context["bot"], context["message"])

        var bot = context["bot"]
        var message = context["message"]

        if (argv.length == 0) {
            bot.reply(message, {
                "attachments": [
                    {
                        "text": "usage: " + buildUsageHelp,
                        "color": "#FFFF00",
                        "attachment_type": "default",
                        "mrkdwn_in": ["text"]
                    }
                ]
            })
            return
        }

        var projectName = argv[0]
        var ref = argv[1]
        var project = null
        var trigger = null

        var environmentVars = []
        for (var i = 2; i < argv.length; i++) {
            environmentVars.push(argv[i])
        }

        var text = "i try start build of `" + projectName + "` at ref `" + ref + "`" +
            (environmentVars.length > 0 ? " with environment vars: `" + environmentVars + "`" : "") +
            "..."
        bot.reply(message, {
            "attachments": [
                {
                    "text": text,
                    "color": "#0000FF",
                    "attachment_type": "default",
                    "mrkdwn_in": ["text"]
                }
            ]
        })

        self.gitLabRequests.findGitLabProject(projectName)
            .then(function (_project) {
                project = _project
                return self.gitLabRequests.findProjectTrigger(project.id)
            })
            .then(function (_trigger) {
                trigger = _trigger
                return self.gitLabRequests.startBuildByTrigger(project.id, trigger.token, ref, environmentVars)
            })
            .then(function (result) {
                    var text = "build created at " + _gitLabUrl + "/" + projectName + "/builds\n" +
                        "Additional info: `" + result + "`"
                    bot.reply(message, {
                        "attachments": [
                            {
                                "text": text,
                                "color": "#00FF00",
                                "attachment_type": "default",
                                "mrkdwn_in": ["text"]
                            }
                        ]
                    })
                },
                function (error) {
                    var text = "build error: `" + error + "`"
                    bot.reply(message, {
                        "attachments": [
                            {
                                "text": text,
                                "color": "#FF0000",
                                "attachment_type": "default",
                                "mrkdwn_in": ["text"]
                            }
                        ]
                    })
                })
    }

    function helpHandler(argv, context) {
        console.log("help arg: %s, bot: %s, message: %s", argv, context["bot"], context["message"])

        var bot = context["bot"]
        var message = context["message"]

        var help = 'I will respond to the following messages: \n' +
            '`help` to see this again.\n' +
            buildUsageHelp + ' for a start build.'
        bot.reply(message, help)
    }
}
