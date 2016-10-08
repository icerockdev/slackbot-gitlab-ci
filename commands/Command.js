/**
 * Created by alekseymikhailov on 30.06.16.
 */

module.exports = function(name, handler) {
    this.name = name
    this.subCommands = []
    this.handler = handler

    this.addCommand = function(cmd) {
        this.subCommands.push(cmd)
        return this
    }

    this.removeCommand = function(cmd) {
        this.subCommands.remove(cmd)
        return this
    }

    this.exec = function(argv, context) {
        if(argv.length > 0) {
            var arg0 = argv[0]

            for(var i = 0;i < this.subCommands.length;i++) {
                var cmd = this.subCommands[i]

                if(arg0 == cmd.name) {
                    cmd.exec(argv.slice(1), context)
                    break
                }
            }
        }

        if(this.handler != null) this.handler(argv, context)
    }
}
