'use strict';
/**
* @name connect.js
* @description Connect SDK for polljoy
* @author Hidde Stokvis <hidde@neverhide.nl>
*/

const crypto = require('crypto');
const request = require('request');

class Connect {
  /**
  * constructor()
  * constructs the Connect class
  *
  * @param {String} appId
  */
  constructor(appId) {
    this.appId = appId;
    this.backend = 'https://api.polljoy.com/3.0/poll/';
  }

  /**
  * findIp
  * finds an ip in a Google AppEngine request object
  *
  * @param {Object} req: standard express request object
  */
  findIp(req) {
    if (
     req.headers &&
     (
       req.headers['X-Appengine-User-Ip'] ||
       req.headers['x-appengine-user-ip']
     )
    ) {
      return req.headers['X-Appengine-User-Ip'] || req.headers['x-appengine-user-ip'];
    } else if (
     req.connection &&
     req.connection.remoteAddress
    ) {
      return req.connection.remoteAddress;
    }
    return false;
  }

  /**
  * sha1()
  * sha1 hash a string
  *
  * @param {String} str
  */
  sha1(str) {
    return crypto.createHash('sha1').update(str).digest('hex');
  }

  /**
  * getDeviceId()
  * Get the sha1 encoded device id
  *
  * @param {Object} req: request Object
  */
  getDeviceId(req) {
    return req.headers['user-agent'] + this.sha1(this.findIp(req));
  }

  /**
  * getDevice()
  * Get the device type
  *
  * @param {Object} req: request Object
  */
  getDevice(req) {
    const agent = req.headers['user-agent'];
    if (agent.match(/iPad/) || agent.match(/iPhone/) || agent.match(/Android/)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
  * getOs()
  * get the OS by user-agent
  *
  * @param {Object} req: request Object
  */
  getOs(req) {
    const agent = req.headers['user-agent'];
    const os = agent.match(/\(([^)]+)\)/);
    if (os.length > 1) {
      return os[1];
    }
    return false;
  }

  /**
  * createEndpoints()
  * create the polljoy endpoints
  *
  * @param {Object} app
  * @param {String} url: endpoint
  */
  createEndpoints(app, url) {
    app.post(url, (req, res) => {
      const deviceId = this.getDeviceId(req);
      if (req.query.register) { // If register query is found
        if (
          req.body &&
          req.body.deviceId &&
          req.session &&
          !(req.body.deviceId === req.session.device_id)
        ) {
          Reflect.deleteProperty(req.session, 'current_session');
        }
        if (!req.session || !req.session.current_session) {
          const params = {
            appId: this.appId,
            deviceId,
            deviceModel: 'web',
            osVersion: this.getOs(req),
          };
          if (req.body && req.body.deviceId) {
            Object.assign(params, {
              deviceId: req.body.deviceId,
            });
          }
          request.post({
            url: `${this.backend}registerSession.json`,
            form: params,
          }, (err, result) => {
            if (err) {
              res.status(500).send(err);
            } else {
              const data = JSON.parse(result.body);
              if (data.session) {
                delete data.session.appId;
              }
              Object.assign(req.session, {
                current_session: JSON.stringify(data),
                device_id: params.deviceId,
              });
              res.send(data);
            }
          });
        } else {
          res.send(req.session.current_session);
        }
        return true;
      }

      if (req.query.sg) {
        const defaultArr = {
          userType: 'Non-Pay',
          appVersion: '',
          deviceId: '',
          level: '',
          sessionCount: '',
          timeSinceInstall: '',
          tags: '',
        };
        const params = req.body;
        for (let i = 0; i < Object.keys(defaultArr); i++) {
          const key = Object.keys(defaultArr)[i];
          if (!params[key]) {
            Object.assign(params, {
              [key]: defaultArr[key],
            });
          }
        }
        Object.assign(params, {
          deviceModel: this.getDevice(req),
          platform: 'web',
          osVersion: this.getOs(req),
        });
        [
          'appVersion',
          'level',
          'sessionCount',
          'timeSinceInstall',
          'tags',
        ].forEach((key) => {
          if (params[key] && params[key].trim() === '') {
            delete params[key];
          }
        });
        if (!params.deviceId || params.deviceId.length === 0) {
          params.deviceId = req.session.device_id || deviceId;
        }
        request.post({
          url: `${this.backend}smartget.json`,
          form: params,
        }, (err, result) => {
          if (err) {
            res.status(500).send(err);
          } else {
            const data = JSON.parse(result.body);
            if (data.polls && typeof data.polls === 'object') {
              if (data.session) {
                delete data.session.appId;
              }
              for (let i = 0; i < Object.keys(data.polls); i++) {
                const key = Object.keys(data.polls)[i];
                delete data.polls[key].PollRequest.appId;
              }
            }
            res.send(data);
          }
        });
        return true;
      }

      if (req.query.response) {
        const params = req.body;
        if (params.deviceId || params.deviceId.length === 0) {
          params.deviceId = req.session.device_id || deviceId;
        }
        request.post({
          url: `${this.backend}response/${req.query.token}.json`,
          form: params,
        }, (err, result) => {
          if (err) {
            res.status(500).send(err);
          } else {
            const data = JSON.parse(result.body);
            res.send(data);
          }
        });
        return true;
      }
      return true;
    });
  }
}

module.exports = Connect;
