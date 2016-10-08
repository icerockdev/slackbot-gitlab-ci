/**
 * Created by alekseymikhailov on 30.06.16.
 */

module.exports = function() {
    this.commands = []

    this.addCommand = function(cmd) {
        this.commands.push(cmd)
        return this
    }

    this.removeCommand = function(cmd) {
        this.commands.remove(cmd)
        return this
    }

    this.exec = function(argv, context) {
        if(argv.length > 0) {
            var arg0 = argv[0]

            for(var i = 0;i < this.commands.length;i++) {
                var cmd = this.commands[i]

                if(arg0 == cmd.name) {
                    cmd.exec(argv.slice(1), context)
                    break
                }
            }
        }
    }
}
