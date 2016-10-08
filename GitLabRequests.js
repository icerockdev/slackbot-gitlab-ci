/**
 * Created by Алексей on 08-Oct-16.
 */

const request = require('request')

module.exports = function (_gitLabUrl, _gitLabToken) {
    this.gitLabUrl = _gitLabUrl
    this.gitLabToken = _gitLabToken
    this.gitLab = require('gitlab')({
        url: this.gitLabUrl,
        token: this.gitLabToken
    })

    var self = this

    this.findGitLabProject = function (name) {
        return new Promise(function (resolve, reject) {
            self.gitLab.projects.all(function (projects) {
                for (var i = 0; i < projects.length; i++) {
                    var project = projects[i]

                    var name_with_namespace_wo_spaces = project.namespace.name + "/" + project.name

                    if (project.path_with_namespace != name && name_with_namespace_wo_spaces != name) continue

                    resolve(project)
                    return
                }

                reject("project not found")
            })
        })
    }

    this.findProjectTrigger = function (projectId) {
        return new Promise(function (resolve, reject) {
            request({
                uri: self.gitLabUrl + "/api/v3/projects/" + projectId + "/triggers",
                headers: {
                    'PRIVATE-TOKEN': self.gitLabToken
                }
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var triggers = JSON.parse(body)

                    if (triggers.length > 0) {
                        resolve(triggers[0])
                    }
                    else {
                        reject("no triggers")
                    }
                }
                else {
                    reject(body)
                }
            })
        })
    }

    this.startBuildByTrigger = function (projectId, triggerToken, ref, environments) {
        var formData = {
            token: triggerToken,
            ref: ref
        }
        for (var i = 0; i < environments.length; i++) {
            var split = environments[i].split('=')

            if (split.length == 0) continue

            var key = "variables[" + split[0] + "]"

            if (split.length == 1) {
                formData[key] = "true"
            }
            else if (split.length == 2) {
                formData[key] = split[1]
            }
        }

        return new Promise(function (resolve, reject) {
            request({
                method: 'POST',
                uri: self.gitLabUrl + "/api/v3/projects/" + projectId + "/trigger/builds",
                formData: formData
            }, function (error, response, body) {
                if (!error && response.statusCode == 201) {
                    resolve(body)
                }
                else {
                    reject(error == null ? body : error)
                }
            })
        })
    }
}