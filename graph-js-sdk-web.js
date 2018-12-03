(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = "function" == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw a.code = "MODULE_NOT_FOUND", a
        }
        var p = n[i] = {exports: {}};
        e[i][0].call(p.exports, function (r) {
          var n = e[i][1][r];
          return o(n || r)
        }, p, p.exports, r, e, n, t)
      }
      return n[i].exports
    }

    for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
    return o
  }

  return r
})()({
  1: [function (require, module, exports) {
    window.MicrosoftGraph = require("./lib/src/index.js")
  }, {"./lib/src/index.js": 11}], 2: [function (require, module, exports) {
    (function (Buffer) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {value: true});
      var GraphHelper = function () {
        function GraphHelper() {
        }

        GraphHelper.serializeContent = function (content) {
          var className = content.constructor.name;
          if (className === "Buffer" || className === "Blob" || className === "File" || className === "FormData" || typeof content === "string") {
            return content
          }
          if (className === "ArrayBuffer") {
            content = Buffer.from(content)
          } else if (className === "Int8Array" || className === "Int16Array" || className === "Int32Array" || className === "Uint8Array" || className === "Uint16Array" || className === "Uint32Array" || className === "Uint8ClampedArray" || className === "Float32Array" || className === "Float64Array" || className === "DataView") {
            content = Buffer.from(content.buffer)
          } else {
            try {
              content = JSON.stringify(content)
            } catch (error) {
              console.log(error);
              throw new Error("Invalid JSON content")
            }
          }
          return content
        };
        return GraphHelper
      }();
      exports.GraphHelper = GraphHelper
    }).call(this, require("buffer").Buffer)
  }, {buffer: 17}], 3: [function (require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    var es6_promise_1 = require("es6-promise");
    require("isomorphic-fetch");
    var common_1 = require("./common");
    var ResponseHandler_1 = require("./ResponseHandler");
    var RequestMethod_1 = require("./RequestMethod");
    var ResponseType_1 = require("./ResponseType");
    var GraphHelper_1 = require("./GraphHelper");
    var GraphRequest = function () {
      function GraphRequest(config, path) {
        var self = this;
        self.config = config;
        self._options = {};
        self._headers = {};
        self.urlComponents = {
          host: self.config.baseUrl,
          version: self.config.defaultVersion,
          oDataQueryParams: {},
          otherURLQueryParams: {}
        };
        self.parsePath(path)
      }

      GraphRequest.prototype.header = function (headerKey, headerValue) {
        var self = this;
        self._headers[headerKey] = headerValue;
        return self
      };
      GraphRequest.prototype.headers = function (headers) {
        var self = this;
        for (var key in headers) {
          self._headers[key] = headers[key]
        }
        return self
      };
      GraphRequest.prototype.option = function (key, value) {
        var self = this;
        self._options[key] = value;
        return self
      };
      GraphRequest.prototype.options = function (options) {
        var self = this;
        for (var key in options) {
          self._options[key] = options[key]
        }
        return self
      };
      GraphRequest.prototype.parsePath = function (rawPath) {
        if (rawPath.indexOf("https://") != -1) {
          rawPath = rawPath.replace("https://", "");
          var endOfHostStrPos = rawPath.indexOf("/");
          this.urlComponents.host = "https://" + rawPath.substring(0, endOfHostStrPos);
          rawPath = rawPath.substring(endOfHostStrPos + 1, rawPath.length);
          var endOfVersionStrPos = rawPath.indexOf("/");
          this.urlComponents.version = rawPath.substring(0, endOfVersionStrPos);
          rawPath = rawPath.substring(endOfVersionStrPos + 1, rawPath.length)
        }
        if (rawPath.charAt(0) == "/") {
          rawPath = rawPath.substr(1)
        }
        var queryStrPos = rawPath.indexOf("?");
        if (queryStrPos == -1) {
          this.urlComponents.path = rawPath
        } else {
          this.urlComponents.path = rawPath.substr(0, queryStrPos);
          var queryParams = rawPath.substring(queryStrPos + 1, rawPath.length).split("&");
          for (var _i = 0, queryParams_1 = queryParams; _i < queryParams_1.length; _i++) {
            var queryParam = queryParams_1[_i];
            var queryParams_2 = queryParam.split("=");
            var key = queryParams_2[0];
            var value = queryParams_2[1];
            if (common_1.oDataQueryNames.indexOf(key)) {
              this.urlComponents.oDataQueryParams[key] = value
            } else {
              this.urlComponents.otherURLQueryParams[key] = value
            }
          }
        }
      };
      GraphRequest.prototype.urlJoin = function (urlSegments) {
        var tr = function (s) {
          return s.replace(/\/+$/, "")
        };
        var tl = function (s) {
          return s.replace(/^\/+/, "")
        };
        var joiner = function (pre, cur) {
          return [tr(pre), tl(cur)].join("/")
        };
        var parts = Array.prototype.slice.call(urlSegments);
        return parts.reduce(joiner)
      };
      GraphRequest.prototype.buildFullUrl = function () {
        var url = this.urlJoin([this.urlComponents.host, this.urlComponents.version, this.urlComponents.path]) + this.createQueryString();
        if (this.config.debugLogging) {
          console.log(url)
        }
        return url
      };
      GraphRequest.prototype.version = function (v) {
        this.urlComponents.version = v;
        return this
      };
      GraphRequest.prototype.select = function (properties) {
        this.addCsvQueryParameter("$select", properties, arguments);
        return this
      };
      GraphRequest.prototype.expand = function (properties) {
        this.addCsvQueryParameter("$expand", properties, arguments);
        return this
      };
      GraphRequest.prototype.orderby = function (properties) {
        this.addCsvQueryParameter("$orderby", properties, arguments);
        return this
      };
      GraphRequest.prototype.filter = function (filterStr) {
        this.urlComponents.oDataQueryParams["$filter"] = filterStr;
        return this
      };
      GraphRequest.prototype.top = function (n) {
        this.urlComponents.oDataQueryParams["$top"] = n;
        return this
      };
      GraphRequest.prototype.skip = function (n) {
        this.urlComponents.oDataQueryParams["$skip"] = n;
        return this
      };
      GraphRequest.prototype.skipToken = function (token) {
        this.urlComponents.oDataQueryParams["$skipToken"] = token;
        return this
      };
      GraphRequest.prototype.count = function (count) {
        this.urlComponents.oDataQueryParams["$count"] = count.toString();
        return this
      };
      GraphRequest.prototype.responseType = function (responseType) {
        this._responseType = responseType;
        return this
      };
      GraphRequest.prototype.addCsvQueryParameter = function (propertyName, propertyValue, additionalProperties) {
        this.urlComponents.oDataQueryParams[propertyName] = this.urlComponents.oDataQueryParams[propertyName] ? this.urlComponents.oDataQueryParams[propertyName] + "," : "";
        var allValues = [];
        if (typeof propertyValue === "string") {
          allValues.push(propertyValue)
        } else {
          allValues = allValues.concat(propertyValue)
        }
        if (additionalProperties.length > 1 && typeof propertyValue === "string") {
          allValues = Array.prototype.slice.call(additionalProperties)
        }
        this.urlComponents.oDataQueryParams[propertyName] += allValues.join(",")
      };
      GraphRequest.prototype.delete = function (callback) {
        var self = this, url = self.buildFullUrl(), options = {method: RequestMethod_1.RequestMethod.DELETE};
        return self.sendRequestAndRouteResponse(url, options, callback)
      };
      GraphRequest.prototype.del = function (callback) {
        return this.delete(callback)
      };
      GraphRequest.prototype.patch = function (content, callback) {
        var self = this, url = self.buildFullUrl(), options = {
          method: RequestMethod_1.RequestMethod.PATCH,
          body: GraphHelper_1.GraphHelper.serializeContent(content),
          headers: {"Content-Type": "application/json"}
        };
        return self.sendRequestAndRouteResponse(url, options, callback)
      };
      GraphRequest.prototype.post = function (content, callback) {
        var self = this, url = self.buildFullUrl(), options = {
          method: RequestMethod_1.RequestMethod.POST,
          body: GraphHelper_1.GraphHelper.serializeContent(content),
          headers: content.constructor !== undefined && content.constructor.name === "FormData" ? {} : {"Content-Type": "application/json"}
        };
        return self.sendRequestAndRouteResponse(url, options, callback)
      };
      GraphRequest.prototype.create = function (content, callback) {
        return this.post(content, callback)
      };
      GraphRequest.prototype.put = function (content, callback) {
        var self = this, url = self.buildFullUrl(), options = {
          method: RequestMethod_1.RequestMethod.PUT,
          body: GraphHelper_1.GraphHelper.serializeContent(content),
          headers: {"Content-Type": "application/octet-stream"}
        };
        return self.sendRequestAndRouteResponse(url, options, callback)
      };
      GraphRequest.prototype.update = function (content, callback) {
        return this.patch(content, callback)
      };
      GraphRequest.prototype.get = function (callback) {
        var self = this, url = self.buildFullUrl(), options = {method: RequestMethod_1.RequestMethod.GET};
        return self.sendRequestAndRouteResponse(url, options, callback)
      };
      GraphRequest.prototype.getStream = function (callback) {
        var self = this, url = self.buildFullUrl(), options = {method: RequestMethod_1.RequestMethod.GET};
        self.responseType(ResponseType_1.ResponseType.STREAM);
        return self.sendRequestAndRouteResponse(url, options, callback)
      };
      GraphRequest.prototype.putStream = function (stream, callback) {
        var self = this, url = self.buildFullUrl(), options = {
          method: RequestMethod_1.RequestMethod.PUT,
          headers: {"Content-Type": "application/octet-stream"},
          body: stream
        };
        return self.sendRequestAndRouteResponse(url, options, callback)
      };
      GraphRequest.prototype.sendRequestAndRouteResponse = function (request, options, callback) {
        if (callback == null && typeof es6_promise_1.Promise !== "undefined") {
          return this.routeResponseToPromise(request, options)
        } else {
          this.routeResponseToCallback(request, options, callback)
        }
      };
      GraphRequest.prototype.routeResponseToPromise = function (request, options) {
        var _this = this;
        return new es6_promise_1.Promise(function (resolve, reject) {
          _this.routeResponseToCallback(request, options, function (err, body) {
            if (err != null) {
              reject(err)
            } else {
              resolve(body)
            }
          })
        })
      };
      GraphRequest.prototype.routeResponseToCallback = function (request, options, callback) {
        var _this = this;
        if (callback === void 0) {
          callback = function () {
          }
        }
        var self = this;
        self.config.authProvider(function (err, accessToken) {
          if (err == null && accessToken != null) {
            options = self.configureRequestOptions(options, accessToken);
            fetch(request, options).then(function (response) {
              _this.convertResponseType(response).then(function (responseValue) {
                ResponseHandler_1.ResponseHandler.init(response, undefined, responseValue, callback)
              }).catch(function (error) {
                ResponseHandler_1.ResponseHandler.init(response, error, undefined, callback)
              })
            }).catch(function (error) {
              ResponseHandler_1.ResponseHandler.init(undefined, error, undefined, callback)
            })
          } else {
            callback(err, null, null)
          }
        })
      };
      GraphRequest.prototype.configureRequestOptions = function (options, accessToken) {
        var self = this,
          defaultHeaders = {Authorization: "Bearer " + accessToken, SdkVersion: "graph-js-" + common_1.PACKAGE_VERSION};
        var configuredOptions = {headers: {}};
        Object.assign(configuredOptions, self.config.fetchOptions, self._options, options);
        Object.assign(configuredOptions.headers, defaultHeaders, self._headers, options.headers);
        return configuredOptions
      };
      GraphRequest.prototype.query = function (queryDictionaryOrString) {
        if (typeof queryDictionaryOrString === "string") {
          var queryStr = queryDictionaryOrString;
          var queryKey = queryStr.split("=")[0];
          var queryValue = queryStr.split("=")[1];
          this.urlComponents.otherURLQueryParams[queryKey] = queryValue
        } else {
          for (var key in queryDictionaryOrString) {
            this.urlComponents.otherURLQueryParams[key] = queryDictionaryOrString[key]
          }
        }
        return this
      };
      GraphRequest.prototype.createQueryString = function () {
        var q = [];
        if (Object.keys(this.urlComponents.oDataQueryParams).length != 0) {
          for (var property in this.urlComponents.oDataQueryParams) {
            q.push(property + "=" + this.urlComponents.oDataQueryParams[property])
          }
        }
        if (Object.keys(this.urlComponents.otherURLQueryParams).length != 0) {
          for (var property in this.urlComponents.otherURLQueryParams) {
            q.push(property + "=" + this.urlComponents.otherURLQueryParams[property])
          }
        }
        if (q.length > 0) {
          return "?" + q.join("&")
        }
        return ""
      };
      GraphRequest.prototype.convertResponseType = function (response) {
        var responseValue;
        if (!this._responseType) {
          this._responseType = ""
        }
        switch (this._responseType.toLowerCase()) {
          case ResponseType_1.ResponseType.ARRAYBUFFER:
            responseValue = response.arrayBuffer();
            break;
          case ResponseType_1.ResponseType.BLOB:
            responseValue = response.blob();
            break;
          case ResponseType_1.ResponseType.DOCUMENT:
            responseValue = response.json();
            break;
          case ResponseType_1.ResponseType.JSON:
            responseValue = response.json();
            break;
          case ResponseType_1.ResponseType.STREAM:
            responseValue = es6_promise_1.Promise.resolve(response.body);
            break;
          case ResponseType_1.ResponseType.TEXT:
            responseValue = response.text();
            break;
          default:
            responseValue = response.json();
            break
        }
        return responseValue
      };
      return GraphRequest
    }();
    exports.GraphRequest = GraphRequest
  }, {
    "./GraphHelper": 2,
    "./RequestMethod": 5,
    "./ResponseHandler": 6,
    "./ResponseType": 7,
    "./common": 8,
    "es6-promise": 18,
    "isomorphic-fetch": 21
  }], 4: [function (require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    var Range = function () {
      function Range(minVal, maxVal) {
        if (minVal === void 0) {
          minVal = -1
        }
        if (maxVal === void 0) {
          maxVal = -1
        }
        var self = this;
        self.minValue = minVal;
        self.maxValue = maxVal
      }

      return Range
    }();
    exports.Range = Range
  }, {}], 5: [function (require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    var RequestMethod;
    (function (RequestMethod) {
      RequestMethod["GET"] = "GET";
      RequestMethod["PATCH"] = "PATCH";
      RequestMethod["POST"] = "POST";
      RequestMethod["PUT"] = "PUT";
      RequestMethod["DELETE"] = "DELETE"
    })(RequestMethod = exports.RequestMethod || (exports.RequestMethod = {}))
  }, {}], 6: [function (require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    var ResponseHandler = function () {
      function ResponseHandler() {
      }

      ResponseHandler.init = function (res, err, resContents, callback) {
        if (res && res.ok) {
          callback(null, resContents, res)
        } else {
          if (err == null && res != null) if (resContents != null && resContents.error != null) callback(ResponseHandler.buildGraphErrorFromResponseObject(resContents.error, res.status), null, res); else callback(ResponseHandler.defaultGraphError(res.status), null, res); else callback(ResponseHandler.ParseError(err), null, res)
        }
      };
      ResponseHandler.ParseError = function (rawErr) {
        if (!rawErr) {
          return ResponseHandler.defaultGraphError(-1)
        }
        return ResponseHandler.buildGraphErrorFromErrorObject(rawErr)
      };
      ResponseHandler.defaultGraphError = function (statusCode) {
        return {statusCode: statusCode, code: null, message: null, requestId: null, date: new Date, body: null}
      };
      ResponseHandler.buildGraphErrorFromErrorObject = function (errObj) {
        var error = ResponseHandler.defaultGraphError(-1);
        error.body = errObj.toString();
        error.message = errObj.message;
        error.date = new Date;
        return error
      };
      ResponseHandler.buildGraphErrorFromResponseObject = function (errObj, statusCode) {
        return {
          statusCode: statusCode,
          code: errObj.code,
          message: errObj.message,
          requestId: errObj.innerError !== undefined ? errObj.innerError["request-id"] : "",
          date: errObj.innerError !== undefined ? new Date(errObj.innerError.date) : new Date,
          body: errObj
        }
      };
      return ResponseHandler
    }();
    exports.ResponseHandler = ResponseHandler
  }, {}], 7: [function (require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    var ResponseType;
    (function (ResponseType) {
      ResponseType["ARRAYBUFFER"] = "arraybuffer";
      ResponseType["BLOB"] = "blob";
      ResponseType["DOCUMENT"] = "document";
      ResponseType["JSON"] = "json";
      ResponseType["STREAM"] = "stream";
      ResponseType["TEXT"] = "text"
    })(ResponseType = exports.ResponseType || (exports.ResponseType = {}))
  }, {}], 8: [function (require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    exports.oDataQueryNames = ["select", "expand", "orderby", "filter", "top", "skip", "skipToken", "count"];
    exports.DEFAULT_VERSION = "v1.0";
    exports.GRAPH_BASE_URL = "https://graph.microsoft.com/";
    exports.PACKAGE_VERSION = "1.3.0";
    exports.oDataQueryNames = exports.oDataQueryNames.concat(exports.oDataQueryNames.map(function (s) {
      return "$" + s
    }))
  }, {}], 9: [function (require, module, exports) {
    (function (Buffer) {
      "use strict";
      var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value))
            } catch (e) {
              reject(e)
            }
          }

          function rejected(value) {
            try {
              step(generator["throw"](value))
            } catch (e) {
              reject(e)
            }
          }

          function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
              resolve(result.value)
            }).then(fulfilled, rejected)
          }

          step((generator = generator.apply(thisArg, _arguments || [])).next())
        })
      };
      var __generator = this && this.__generator || function (thisArg, body) {
        var _ = {
          label: 0, sent: function () {
            if (t[0] & 1) throw t[1];
            return t[1]
          }, trys: [], ops: []
        }, f, y, t, g;
        return g = {
          next: verb(0),
          throw: verb(1),
          return: verb(2)
        }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
          return this
        }), g;

        function verb(n) {
          return function (v) {
            return step([n, v])
          }
        }

        function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
              case 0:
              case 1:
                t = op;
                break;
              case 4:
                _.label++;
                return {value: op[1], done: false};
              case 5:
                _.label++;
                y = op[1];
                op = [0];
                continue;
              case 7:
                op = _.ops.pop();
                _.trys.pop();
                continue;
              default:
                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                  _ = 0;
                  continue
                }
                if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                  _.label = op[1];
                  break
                }
                if (op[0] === 6 && _.label < t[1]) {
                  _.label = t[1];
                  t = op;
                  break
                }
                if (t && _.label < t[2]) {
                  _.label = t[2];
                  _.ops.push(op);
                  break
                }
                if (t[2]) _.ops.pop();
                _.trys.pop();
                continue
            }
            op = body.call(thisArg, _)
          } catch (e) {
            op = [6, e];
            y = 0
          } finally {
            f = t = 0
          }
          if (op[0] & 5) throw op[1];
          return {value: op[0] ? op[1] : void 0, done: true}
        }
      };
      Object.defineProperty(exports, "__esModule", {value: true});
      var RequestMethod_1 = require("../RequestMethod");
      var BatchRequestContent = function () {
        function BatchRequestContent(requests) {
          var self = this;
          self.requests = new Map;
          if (typeof requests !== "undefined") {
            var limit = BatchRequestContent.requestLimit;
            if (requests.length > limit) {
              var error = new Error("Maximum requests limit exceeded, Max allowed number of requests are " + limit);
              error.name = "Limit Exceeded Error";
              throw error
            }
            for (var _i = 0, requests_1 = requests; _i < requests_1.length; _i++) {
              var req = requests_1[_i];
              self.addRequest(req)
            }
          }
        }

        BatchRequestContent.prototype.addRequest = function (request) {
          var self = this, limit = BatchRequestContent.requestLimit;
          if (request.id === "") {
            var error = new Error("Id for a request is empty, Please provide an unique id");
            error.name = "Empty Id For Request";
            throw error
          }
          if (self.requests.size === limit) {
            var error = new Error("Maximum requests limit exceeded, Max allowed number of requests are " + limit);
            error.name = "Limit Exceeded Error";
            throw error
          }
          if (self.requests.has(request.id)) {
            var error = new Error("Adding request with duplicate id " + request.id + ", Make the id of the requests unique");
            error.name = "Duplicate RequestId Error";
            throw error
          }
          self.requests.set(request.id, request);
          return request.id
        };
        BatchRequestContent.prototype.removeRequest = function (requestId) {
          var self = this, deleteStatus = self.requests.delete(requestId), iterator = self.requests.entries(),
            cur = iterator.next();
          while (!cur.done) {
            var dependencies = cur.value[1].dependsOn;
            if (typeof dependencies !== "undefined") {
              var index = dependencies.indexOf(requestId);
              if (index !== -1) {
                dependencies.splice(index, 1)
              }
              if (dependencies.length === 0) {
                delete cur.value[1].dependsOn
              }
            }
            cur = iterator.next()
          }
          return deleteStatus
        };
        BatchRequestContent.prototype.getContent = function () {
          return __awaiter(this, void 0, void 0, function () {
            var self, requestBody, requests, iterator, cur, error, error, requestStep, batchRequestData, error;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  self = this, requestBody = {}, requests = [], iterator = self.requests.entries(), cur = iterator.next();
                  if (cur.done) {
                    error = new Error("No requests added yet, Please add at least one request.");
                    error.name = "Empty Payload";
                    throw error
                  }
                  if (!BatchRequestContent.validateDependencies(self.requests)) {
                    error = new Error("Invalid dependency found, Dependency should be:\n1. Parallel - no individual request states a dependency in the dependsOn property.\n2. Serial - all individual requests depend on the previous individual request.\n3. Same - all individual requests that state a dependency in the dependsOn property, state the same dependency.");
                    error.name = "Invalid Dependency";
                    throw error
                  }
                  _a.label = 1;
                case 1:
                  if (!!cur.done) return [3, 3];
                  requestStep = cur.value[1];
                  return [4, BatchRequestContent.getRequestData(requestStep.request)];
                case 2:
                  batchRequestData = _a.sent();
                  if (batchRequestData.body !== undefined && (batchRequestData.headers === undefined || batchRequestData.headers["content-type"] === undefined)) {
                    error = new Error("Content-type header is not mentioned for request #" + requestStep.id + ", For request having body, Content-type header should be mentioned");
                    error.name = "Invalid Content-type header";
                    throw error
                  }
                  batchRequestData.id = requestStep.id;
                  if (requestStep.dependsOn !== undefined && requestStep.dependsOn.length > 0) {
                    batchRequestData.dependsOn = requestStep.dependsOn
                  }
                  requests.push(batchRequestData);
                  cur = iterator.next();
                  return [3, 1];
                case 3:
                  requestBody.requests = requests;
                  return [2, requestBody]
              }
            })
          })
        };
        BatchRequestContent.validateDependencies = function (requests) {
          var isParallel = function (requests) {
            var iterator = requests.entries(), cur = iterator.next();
            while (!cur.done) {
              var curReq = cur.value[1];
              if (curReq.dependsOn !== undefined && curReq.dependsOn.length > 0) {
                return false
              }
              cur = iterator.next()
            }
            return true
          };
          var isSerial = function (requests) {
            var iterator = requests.entries(), cur = iterator.next();
            var firstRequest = cur.value[1];
            if (firstRequest.dependsOn !== undefined && firstRequest.dependsOn.length > 0) {
              return false
            }
            var prev = cur;
            cur = iterator.next();
            while (!cur.done) {
              var curReq = cur.value[1];
              if (curReq.dependsOn === undefined || curReq.dependsOn.length !== 1 || curReq.dependsOn[0] !== prev.value[1].id) {
                return false
              }
              prev = cur;
              cur = iterator.next()
            }
            return true
          };
          var isSame = function (requests) {
            var iterator = requests.entries(), cur = iterator.next();
            var firstRequest = cur.value[1], dependencyId;
            if (firstRequest.dependsOn === undefined || firstRequest.dependsOn.length === 0) {
              dependencyId = firstRequest.id
            } else {
              if (firstRequest.dependsOn.length === 1) {
                var fDependencyId = firstRequest.dependsOn[0];
                if (fDependencyId !== firstRequest.id && requests.has(fDependencyId)) {
                  dependencyId = fDependencyId
                } else {
                  return false
                }
              } else {
                return false
              }
            }
            cur = iterator.next();
            while (!cur.done) {
              var curReq = cur.value[1];
              if ((curReq.dependsOn === undefined || curReq.dependsOn.length === 0) && dependencyId !== curReq.id) {
                return false
              }
              if (curReq.dependsOn !== undefined && curReq.dependsOn.length !== 0) {
                if (curReq.dependsOn.length === 1 && (curReq.id === dependencyId || curReq.dependsOn[0] !== dependencyId)) {
                  return false
                }
                if (curReq.dependsOn.length > 1) {
                  return false
                }
              }
              cur = iterator.next()
            }
            return true
          };
          if (requests.size === 0) {
            var error = new Error("Empty requests map, Please provide at least one request.");
            error.name = "Empty Requests Error";
            throw error
          }
          return isParallel(requests) || isSerial(requests) || isSame(requests)
        };
        BatchRequestContent.getRequestData = function (request) {
          return __awaiter(this, void 0, void 0, function () {
            var requestData, hasHttpRegex, headers, _a;
            return __generator(this, function (_b) {
              switch (_b.label) {
                case 0:
                  requestData = {};
                  hasHttpRegex = new RegExp("^https?://");
                  if (hasHttpRegex.test(request.url)) {
                    requestData.url = "/" + request.url.split(/.*?\/\/.*?\//)[1]
                  } else {
                    requestData.url = request.url
                  }
                  requestData.method = request.method;
                  headers = {};
                  request.headers.forEach(function (value, key) {
                    headers[key] = value
                  });
                  if (Object.keys(headers).length) {
                    requestData.headers = headers
                  }
                  if (!(request.method === RequestMethod_1.RequestMethod.PATCH || request.method === RequestMethod_1.RequestMethod.POST || request.method === RequestMethod_1.RequestMethod.PUT)) return [3, 2];
                  _a = requestData;
                  return [4, BatchRequestContent.getRequestBody(request)];
                case 1:
                  _a.body = _b.sent();
                  _b.label = 2;
                case 2:
                  return [2, requestData]
              }
            })
          })
        };
        BatchRequestContent.getRequestBody = function (request) {
          return __awaiter(this, void 0, void 0, function () {
            var bodyParsed, body, cloneReq, e_1, blob_1, reader_1, buffer, e_2;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  bodyParsed = false;
                  _a.label = 1;
                case 1:
                  _a.trys.push([1, 3, , 4]);
                  cloneReq = request.clone();
                  return [4, cloneReq.json()];
                case 2:
                  body = _a.sent();
                  bodyParsed = true;
                  return [3, 4];
                case 3:
                  e_1 = _a.sent();
                  return [3, 4];
                case 4:
                  if (!!bodyParsed) return [3, 12];
                  _a.label = 5;
                case 5:
                  _a.trys.push([5, 11, , 12]);
                  if (!(typeof Blob !== "undefined")) return [3, 8];
                  return [4, request.blob()];
                case 6:
                  blob_1 = _a.sent();
                  reader_1 = new FileReader;
                  return [4, new Promise(function (resolve) {
                    reader_1.addEventListener("load", function () {
                      var dataURL = reader_1.result,
                        regex = new RegExp("^s*data:(.+?/.+?(;.+?=.+?)*)?(;base64)?,(.*)s*$"),
                        segments = regex.exec(dataURL);
                      resolve(segments[4])
                    }, false);
                    reader_1.readAsDataURL(blob_1)
                  })];
                case 7:
                  body = _a.sent();
                  return [3, 10];
                case 8:
                  if (!(typeof Buffer !== "undefined")) return [3, 10];
                  return [4, request.buffer()];
                case 9:
                  buffer = _a.sent();
                  body = buffer.toString("base64");
                  _a.label = 10;
                case 10:
                  bodyParsed = true;
                  return [3, 12];
                case 11:
                  e_2 = _a.sent();
                  return [3, 12];
                case 12:
                  return [2, body]
              }
            })
          })
        };
        BatchRequestContent.prototype.addDependency = function (dependentId, dependencyId) {
          var self = this;
          if (!self.requests.has(dependentId)) {
            var error = new Error("Dependent " + dependentId + " does not exists, Please check the id");
            error.name = "Invalid Dependent";
            throw error
          }
          if (typeof dependencyId !== "undefined" && !self.requests.has(dependencyId)) {
            var error = new Error("Dependency " + dependencyId + " does not exists, Please check the id");
            error.name = "Invalid Dependency";
            throw error
          }
          if (typeof dependencyId !== "undefined") {
            var dependent = self.requests.get(dependentId);
            if (dependent.dependsOn === undefined) {
              dependent.dependsOn = []
            }
            if (dependent.dependsOn.includes(dependencyId)) {
              var error = new Error("Dependency " + dependencyId + " is already added for the request " + dependentId);
              error.name = "Duplicate Dependency";
              throw error
            }
            dependent.dependsOn.push(dependencyId)
          } else {
            var prev = void 0, iterator = self.requests.entries(), cur = iterator.next();
            while (!cur.done && cur.value[1].id !== dependentId) {
              prev = cur;
              cur = iterator.next()
            }
            if (typeof prev !== "undefined") {
              var dependencyId_1 = prev.value[0];
              if (cur.value[1].dependsOn === undefined) {
                cur.value[1].dependsOn = []
              }
              if (cur.value[1].dependsOn.includes(dependencyId_1)) {
                var error = new Error("Dependency " + dependencyId_1 + " is already added for the request " + dependentId);
                error.name = "Duplicate Dependency";
                throw error
              }
              cur.value[1].dependsOn.push(dependencyId_1)
            } else {
              var error = new Error("Can't add dependency " + dependencyId + ", There is only a dependent request in the batch");
              error.name = "Invalid Dependency Addition";
              throw error
            }
          }
        };
        BatchRequestContent.prototype.removeDependency = function (dependentId, dependencyId) {
          var request = this.requests.get(dependentId);
          if (typeof request === "undefined" || request.dependsOn === undefined || request.dependsOn.length === 0) {
            return false
          }
          if (typeof dependencyId !== "undefined") {
            var index = request.dependsOn.indexOf(dependencyId);
            if (index === -1) {
              return false
            }
            request.dependsOn.splice(index, 1);
            return true
          } else {
            delete request.dependsOn;
            return true
          }
        };
        BatchRequestContent.requestLimit = 20;
        return BatchRequestContent
      }();
      exports.BatchRequestContent = BatchRequestContent
    }).call(this, require("buffer").Buffer)
  }, {"../RequestMethod": 5, buffer: 17}], 10: [function (require, module, exports) {
    "use strict";
    var __generator = this && this.__generator || function (thisArg, body) {
      var _ = {
        label: 0, sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1]
        }, trys: [], ops: []
      }, f, y, t, g;
      return g = {
        next: verb(0),
        throw: verb(1),
        return: verb(2)
      }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this
      }), g;

      function verb(n) {
        return function (v) {
          return step([n, v])
        }
      }

      function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return {value: op[1], done: false};
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue
              }
              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue
          }
          op = body.call(thisArg, _)
        } catch (e) {
          op = [6, e];
          y = 0
        } finally {
          f = t = 0
        }
        if (op[0] & 5) throw op[1];
        return {value: op[0] ? op[1] : void 0, done: true}
      }
    };
    Object.defineProperty(exports, "__esModule", {value: true});
    var BatchResponseContent = function () {
      function BatchResponseContent(response) {
        var self = this;
        self.responses = new Map;
        self.update(response)
      }

      BatchResponseContent.prototype.update = function (response) {
        var self = this;
        self.nextLink = response["@nextLink"];
        var responses = response.responses;
        for (var i = 0, l = responses.length; i < l; i++) {
          self.responses.set(responses[i].id, self.createResponseObject(responses[i]))
        }
      };
      BatchResponseContent.prototype.createResponseObject = function (responseJSON) {
        var body = responseJSON.body, options = {};
        options.status = responseJSON.status;
        if (responseJSON.statusText !== undefined) {
          options.statusText = responseJSON.statusText
        }
        options.headers = responseJSON.headers;
        return new Response(body, options)
      };
      BatchResponseContent.prototype.getResponseById = function (requestId) {
        return this.responses.get(requestId)
      };
      BatchResponseContent.prototype.getResponses = function () {
        return this.responses
      };
      BatchResponseContent.prototype.getResponsesIterator = function () {
        var self, iterator, cur;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              self = this, iterator = self.responses.entries(), cur = iterator.next();
              _a.label = 1;
            case 1:
              if (!!cur.done) return [3, 3];
              return [4, cur.value];
            case 2:
              _a.sent();
              cur = iterator.next();
              return [3, 1];
            case 3:
              return [2]
          }
        })
      };
      return BatchResponseContent
    }();
    exports.BatchResponseContent = BatchResponseContent
  }, {}], 11: [function (require, module, exports) {
    "use strict";

    function __export(m) {
      for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p]
    }

    Object.defineProperty(exports, "__esModule", {value: true});
    var common_1 = require("./common");
    var GraphRequest_1 = require("./GraphRequest");
    var Client = function () {
      function Client() {
        this.config = {debugLogging: false, defaultVersion: common_1.DEFAULT_VERSION, baseUrl: common_1.GRAPH_BASE_URL}
      }

      Client.init = function (clientOptions) {
        var graphClient = new Client;
        for (var key in clientOptions) {
          graphClient.config[key] = clientOptions[key]
        }
        return graphClient
      };
      Client.prototype.api = function (path) {
        return new GraphRequest_1.GraphRequest(this.config, path)
      };
      return Client
    }();
    exports.Client = Client;
    __export(require("./GraphRequest"));
    __export(require("./common"));
    __export(require("./ResponseType"));
    __export(require("./ResponseHandler"));
    __export(require("./tasks/OneDriveLargeFileUploadTask"));
    __export(require("./tasks/PageIterator"));
    __export(require("./content/BatchRequestContent"));
    __export(require("./content/BatchResponseContent"))
  }, {
    "./GraphRequest": 3,
    "./ResponseHandler": 6,
    "./ResponseType": 7,
    "./common": 8,
    "./content/BatchRequestContent": 9,
    "./content/BatchResponseContent": 10,
    "./tasks/OneDriveLargeFileUploadTask": 13,
    "./tasks/PageIterator": 15
  }], 12: [function (require, module, exports) {
    "use strict";
    var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
      return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value))
          } catch (e) {
            reject(e)
          }
        }

        function rejected(value) {
          try {
            step(generator["throw"](value))
          } catch (e) {
            reject(e)
          }
        }

        function step(result) {
          result.done ? resolve(result.value) : new P(function (resolve) {
            resolve(result.value)
          }).then(fulfilled, rejected)
        }

        step((generator = generator.apply(thisArg, _arguments || [])).next())
      })
    };
    var __generator = this && this.__generator || function (thisArg, body) {
      var _ = {
        label: 0, sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1]
        }, trys: [], ops: []
      }, f, y, t, g;
      return g = {
        next: verb(0),
        throw: verb(1),
        return: verb(2)
      }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this
      }), g;

      function verb(n) {
        return function (v) {
          return step([n, v])
        }
      }

      function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return {value: op[1], done: false};
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue
              }
              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue
          }
          op = body.call(thisArg, _)
        } catch (e) {
          op = [6, e];
          y = 0
        } finally {
          f = t = 0
        }
        if (op[0] & 5) throw op[1];
        return {value: op[0] ? op[1] : void 0, done: true}
      }
    };
    Object.defineProperty(exports, "__esModule", {value: true});
    var Range_1 = require("../Range");
    var LargeFileUploadTask = function () {
      function LargeFileUploadTask(client, file, uploadSession, options) {
        this.DEFAULT_FILE_SIZE = 5 * 1024 * 1024;
        var self = this;
        self.client = client;
        self.file = file;
        if (options.rangeSize === undefined) {
          options.rangeSize = self.DEFAULT_FILE_SIZE
        }
        self.options = options;
        self.uploadSession = uploadSession;
        self.nextRange = new Range_1.Range(0, self.options.rangeSize - 1)
      }

      LargeFileUploadTask.prototype.parseRange = function (ranges) {
        var rangeStr = ranges[0];
        if (typeof rangeStr === "undefined" || rangeStr === "") {
          return new Range_1.Range
        }
        var firstRange = rangeStr.split("-"), minVal = parseInt(firstRange[0]), maxVal = parseInt(firstRange[1]);
        if (Number.isNaN(maxVal)) {
          maxVal = this.file.size - 1
        }
        return new Range_1.Range(minVal, maxVal)
      };
      LargeFileUploadTask.prototype.updateTaskStatus = function (response) {
        var self = this;
        self.uploadSession.expiry = new Date(response.expirationDateTime);
        self.nextRange = self.parseRange(response.nextExpectedRanges)
      };
      LargeFileUploadTask.prototype.getNextRange = function () {
        var self = this;
        if (self.nextRange.minValue === -1) {
          return self.nextRange
        }
        var minVal = self.nextRange.minValue, maxValue = minVal + self.options.rangeSize - 1;
        if (maxValue >= self.file.size) {
          maxValue = self.file.size - 1
        }
        return new Range_1.Range(minVal, maxValue)
      };
      LargeFileUploadTask.prototype.sliceFile = function (range) {
        var blob = this.file.content.slice(range.minValue, range.maxValue + 1);
        return blob
      };
      LargeFileUploadTask.prototype.upload = function () {
        return __awaiter(this, void 0, void 0, function () {
          var self, nextRange, err, fileSlice, response, err_1;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                self = this;
                _a.label = 1;
              case 1:
                _a.trys.push([1, 5, , 6]);
                _a.label = 2;
              case 2:
                if (!true) return [3, 4];
                nextRange = self.getNextRange();
                if (nextRange.maxValue === -1) {
                  err = new Error("Task with which you are trying to upload is already completed, Please check for your uploaded file");
                  err.name = "Invalid Session";
                  throw err
                }
                fileSlice = self.sliceFile(nextRange);
                return [4, self.uploadSlice(fileSlice, nextRange, self.file.size)];
              case 3:
                response = _a.sent();
                if (response.id !== undefined) {
                  return [2, response]
                } else {
                  self.updateTaskStatus(response)
                }
                return [3, 2];
              case 4:
                return [3, 6];
              case 5:
                err_1 = _a.sent();
                throw err_1;
              case 6:
                return [2]
            }
          })
        })
      };
      LargeFileUploadTask.prototype.uploadSlice = function (fileSlice, range, totalSize) {
        return __awaiter(this, void 0, void 0, function () {
          var self, err_2;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                self = this;
                _a.label = 1;
              case 1:
                _a.trys.push([1, 3, , 4]);
                return [4, self.client.api(self.uploadSession.url).headers({
                  "Content-Length": "" + (range.maxValue - range.minValue + 1),
                  "Content-Range": "bytes " + range.minValue + "-" + range.maxValue + "/" + totalSize
                }).put(fileSlice)];
              case 2:
                return [2, _a.sent()];
              case 3:
                err_2 = _a.sent();
                throw err_2;
              case 4:
                return [2]
            }
          })
        })
      };
      LargeFileUploadTask.prototype.cancel = function () {
        return __awaiter(this, void 0, void 0, function () {
          var self, err_3;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                self = this;
                _a.label = 1;
              case 1:
                _a.trys.push([1, 3, , 4]);
                return [4, self.client.api(self.uploadSession.url).delete()];
              case 2:
                return [2, _a.sent()];
              case 3:
                err_3 = _a.sent();
                throw err_3;
              case 4:
                return [2]
            }
          })
        })
      };
      LargeFileUploadTask.prototype.getStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
          var self, response, err_4;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                self = this;
                _a.label = 1;
              case 1:
                _a.trys.push([1, 3, , 4]);
                return [4, self.client.api(self.uploadSession.url).get()];
              case 2:
                response = _a.sent();
                self.updateTaskStatus(response);
                return [2, response];
              case 3:
                err_4 = _a.sent();
                throw err_4;
              case 4:
                return [2]
            }
          })
        })
      };
      LargeFileUploadTask.prototype.resume = function () {
        return __awaiter(this, void 0, void 0, function () {
          var self, err_5;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                self = this;
                _a.label = 1;
              case 1:
                _a.trys.push([1, 4, , 5]);
                return [4, self.getStatus()];
              case 2:
                _a.sent();
                return [4, self.upload()];
              case 3:
                return [2, _a.sent()];
              case 4:
                err_5 = _a.sent();
                throw err_5;
              case 5:
                return [2]
            }
          })
        })
      };
      return LargeFileUploadTask
    }();
    exports.LargeFileUploadTask = LargeFileUploadTask
  }, {"../Range": 4}], 13: [function (require, module, exports) {
    "use strict";
    var __extends = this && this.__extends || function () {
      var extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (d, b) {
        d.__proto__ = b
      } || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]
      };
      return function (d, b) {
        extendStatics(d, b);

        function __() {
          this.constructor = d
        }

        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __)
      }
    }();
    var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
      return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value))
          } catch (e) {
            reject(e)
          }
        }

        function rejected(value) {
          try {
            step(generator["throw"](value))
          } catch (e) {
            reject(e)
          }
        }

        function step(result) {
          result.done ? resolve(result.value) : new P(function (resolve) {
            resolve(result.value)
          }).then(fulfilled, rejected)
        }

        step((generator = generator.apply(thisArg, _arguments || [])).next())
      })
    };
    var __generator = this && this.__generator || function (thisArg, body) {
      var _ = {
        label: 0, sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1]
        }, trys: [], ops: []
      }, f, y, t, g;
      return g = {
        next: verb(0),
        throw: verb(1),
        return: verb(2)
      }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this
      }), g;

      function verb(n) {
        return function (v) {
          return step([n, v])
        }
      }

      function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return {value: op[1], done: false};
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue
              }
              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue
          }
          op = body.call(thisArg, _)
        } catch (e) {
          op = [6, e];
          y = 0
        } finally {
          f = t = 0
        }
        if (op[0] & 5) throw op[1];
        return {value: op[0] ? op[1] : void 0, done: true}
      }
    };
    Object.defineProperty(exports, "__esModule", {value: true});
    var LargeFileUploadTask_1 = require("./LargeFileUploadTask");
    var OneDriveLargeFileUploadTaskUtil_1 = require("./OneDriveLargeFileUploadTaskUtil");
    var OneDriveLargeFileUploadTask = function (_super) {
      __extends(OneDriveLargeFileUploadTask, _super);

      function OneDriveLargeFileUploadTask(client, file, uploadSession, options) {
        return _super.call(this, client, file, uploadSession, options) || this
      }

      OneDriveLargeFileUploadTask.create = function (client, file, options) {
        return __awaiter(this, void 0, void 0, function () {
          var fileObj, _file, b, requestUrl, session, rangeSize, err_1;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                fileObj = {};
                fileObj.name = options.fileName;
                switch (file.constructor.name) {
                  case"Blob":
                    fileObj.content = new File([file], fileObj.name);
                    fileObj.size = fileObj.content.size;
                    break;
                  case"File":
                    _file = file;
                    fileObj.content = _file;
                    fileObj.size = _file.size;
                    break;
                  case"Buffer":
                    b = file;
                    fileObj.size = b.byteLength - b.byteOffset;
                    fileObj.content = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
                    break
                }
                _a.label = 1;
              case 1:
                _a.trys.push([1, 3, , 4]);
                requestUrl = OneDriveLargeFileUploadTask.constructCreateSessionUrl(options.fileName, options.path);
                return [4, OneDriveLargeFileUploadTask.createUploadSession(client, requestUrl, options.fileName)];
              case 2:
                session = _a.sent();
                rangeSize = OneDriveLargeFileUploadTaskUtil_1.getValidRangeSize(options.rangeSize);
                return [2, new OneDriveLargeFileUploadTask(client, fileObj, session, {rangeSize: rangeSize})];
              case 3:
                err_1 = _a.sent();
                throw err_1;
              case 4:
                return [2]
            }
          })
        })
      };
      OneDriveLargeFileUploadTask.constructCreateSessionUrl = function (fileName, path) {
        if (path === void 0) {
          path = OneDriveLargeFileUploadTask.DEFAULT_UPLOAD_PATH
        }
        fileName = fileName.trim();
        path = path.trim();
        if (path === "") {
          path = "/"
        }
        if (path[0] !== "/") {
          path = "/" + path
        }
        if (path[path.length - 1] !== "/") {
          path = path + "/"
        }
        return encodeURI("/me/drive/root:" + path + fileName + ":/createUploadSession")
      };
      OneDriveLargeFileUploadTask.createUploadSession = function (client, requestUrl, fileName) {
        return __awaiter(this, void 0, void 0, function () {
          var payload, session, err_2;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                payload = {item: {"@microsoft.graph.conflictBehavior": "rename", name: fileName}};
                _a.label = 1;
              case 1:
                _a.trys.push([1, 3, , 4]);
                return [4, client.api(requestUrl).post(payload)];
              case 2:
                session = _a.sent();
                return [2, {url: session.uploadUrl, expiry: new Date(session.expirationDateTime)}];
              case 3:
                err_2 = _a.sent();
                throw err_2;
              case 4:
                return [2]
            }
          })
        })
      };
      OneDriveLargeFileUploadTask.prototype.commit = function (requestUrl) {
        return __awaiter(this, void 0, void 0, function () {
          var self, payload, err_3;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                self = this;
                _a.label = 1;
              case 1:
                _a.trys.push([1, 3, , 4]);
                payload = {
                  name: self.file.name,
                  "@microsoft.graph.conflictBehavior": "rename",
                  "@microsoft.graph.sourceUrl": self.uploadSession.url
                };
                return [4, self.client.api(requestUrl).put(payload)];
              case 2:
                return [2, _a.sent()];
              case 3:
                err_3 = _a.sent();
                throw err_3;
              case 4:
                return [2]
            }
          })
        })
      };
      OneDriveLargeFileUploadTask.DEFAULT_UPLOAD_PATH = "/";
      return OneDriveLargeFileUploadTask
    }(LargeFileUploadTask_1.LargeFileUploadTask);
    exports.OneDriveLargeFileUploadTask = OneDriveLargeFileUploadTask
  }, {"./LargeFileUploadTask": 12, "./OneDriveLargeFileUploadTaskUtil": 14}], 14: [function (require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    var DEFAULT_FILE_SIZE = 5 * 1024 * 1024;
    var roundTo320KB = function (value) {
      if (value > 320 * 1024) {
        value = Math.floor(value / (320 * 1024)) * 320 * 1024
      }
      return value
    };
    exports.getValidRangeSize = function (rangeSize) {
      if (rangeSize === void 0) {
        rangeSize = DEFAULT_FILE_SIZE
      }
      var sixtyMB = 60 * 1024 * 1024;
      if (rangeSize > sixtyMB) {
        rangeSize = sixtyMB
      }
      return roundTo320KB(rangeSize)
    }
  }, {}], 15: [function (require, module, exports) {
    "use strict";
    var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
      return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value))
          } catch (e) {
            reject(e)
          }
        }

        function rejected(value) {
          try {
            step(generator["throw"](value))
          } catch (e) {
            reject(e)
          }
        }

        function step(result) {
          result.done ? resolve(result.value) : new P(function (resolve) {
            resolve(result.value)
          }).then(fulfilled, rejected)
        }

        step((generator = generator.apply(thisArg, _arguments || [])).next())
      })
    };
    var __generator = this && this.__generator || function (thisArg, body) {
      var _ = {
        label: 0, sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1]
        }, trys: [], ops: []
      }, f, y, t, g;
      return g = {
        next: verb(0),
        throw: verb(1),
        return: verb(2)
      }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this
      }), g;

      function verb(n) {
        return function (v) {
          return step([n, v])
        }
      }

      function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return {value: op[1], done: false};
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue
              }
              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue
          }
          op = body.call(thisArg, _)
        } catch (e) {
          op = [6, e];
          y = 0
        } finally {
          f = t = 0
        }
        if (op[0] & 5) throw op[1];
        return {value: op[0] ? op[1] : void 0, done: true}
      }
    };
    Object.defineProperty(exports, "__esModule", {value: true});
    var PageIterator = function () {
      function PageIterator(client, pageCollection, callback) {
        var self = this;
        self.client = client;
        self.collection = pageCollection.value;
        self.nextLink = pageCollection["@odata.nextLink"];
        self.deltaLink = pageCollection["@odata.deltaLink"];
        self.callback = callback
      }

      PageIterator.prototype.iterationHelper = function () {
        var self = this;
        if (self.collection === undefined || self.collection.length === 0) {
          return false
        }
        var advance = true;
        while (advance && self.collection.length !== 0) {
          var item = self.collection.shift();
          advance = self.callback(item)
        }
        return advance
      };
      PageIterator.prototype.fetchAndUpdateNextPageData = function () {
        return __awaiter(this, void 0, void 0, function () {
          var self_1, response, error_1;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 2, , 3]);
                self_1 = this;
                return [4, self_1.client.api(self_1.nextLink).get()];
              case 1:
                response = _a.sent();
                self_1.collection = response.value;
                self_1.nextLink = response["@odata.nextLink"];
                self_1.deltaLink = response["@odata.deltaLink"];
                return [3, 3];
              case 2:
                error_1 = _a.sent();
                throw error_1;
              case 3:
                return [2]
            }
          })
        })
      };
      PageIterator.prototype.getDeltaLink = function () {
        return this.deltaLink
      };
      PageIterator.prototype.iterate = function () {
        return __awaiter(this, void 0, void 0, function () {
          var self_2, advance, error_2;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 6, , 7]);
                self_2 = this, advance = self_2.iterationHelper();
                _a.label = 1;
              case 1:
                if (!advance) return [3, 5];
                if (!(self_2.nextLink !== undefined)) return [3, 3];
                return [4, self_2.fetchAndUpdateNextPageData()];
              case 2:
                _a.sent();
                advance = self_2.iterationHelper();
                return [3, 4];
              case 3:
                advance = false;
                _a.label = 4;
              case 4:
                return [3, 1];
              case 5:
                return [3, 7];
              case 6:
                error_2 = _a.sent();
                throw error_2;
              case 7:
                return [2]
            }
          })
        })
      };
      PageIterator.prototype.resume = function () {
        return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            try {
              return [2, this.iterate()]
            } catch (error) {
              throw error
            }
            return [2]
          })
        })
      };
      return PageIterator
    }();
    exports.PageIterator = PageIterator
  }, {}], 16: [function (require, module, exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i
    }
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;

    function getLens(b64) {
      var len = b64.length;
      if (len % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4")
      }
      var validLen = b64.indexOf("=");
      if (validLen === -1) validLen = len;
      var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
      return [validLen, placeHoldersLen]
    }

    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen
    }

    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen
    }

    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
      for (var i = 0; i < len; i += 4) {
        tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
        arr[curByte++] = tmp & 255
      }
      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255
      }
      return arr
    }

    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63]
    }

    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (uint8[i + 2] & 255);
        output.push(tripletToBase64(tmp))
      }
      return output.join("")
    }

    function fromByteArray(uint8) {
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength))
      }
      if (extraBytes === 1) {
        tmp = uint8[len - 1];
        parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==")
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=")
      }
      return parts.join("")
    }
  }, {}], 17: [function (require, module, exports) {
    (function (global) {
      "use strict";
      var base64 = require("base64-js");
      var ieee754 = require("ieee754");
      var isArray = require("isarray");
      exports.Buffer = Buffer;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();
      exports.kMaxLength = kMaxLength();

      function typedArraySupport() {
        try {
          var arr = new Uint8Array(1);
          arr.__proto__ = {
            __proto__: Uint8Array.prototype, foo: function () {
              return 42
            }
          };
          return arr.foo() === 42 && typeof arr.subarray === "function" && arr.subarray(1, 1).byteLength === 0
        } catch (e) {
          return false
        }
      }

      function kMaxLength() {
        return Buffer.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823
      }

      function createBuffer(that, length) {
        if (kMaxLength() < length) {
          throw new RangeError("Invalid typed array length")
        }
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          that = new Uint8Array(length);
          that.__proto__ = Buffer.prototype
        } else {
          if (that === null) {
            that = new Buffer(length)
          }
          that.length = length
        }
        return that
      }

      function Buffer(arg, encodingOrOffset, length) {
        if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
          return new Buffer(arg, encodingOrOffset, length)
        }
        if (typeof arg === "number") {
          if (typeof encodingOrOffset === "string") {
            throw new Error("If encoding is specified then the first argument must be a string")
          }
          return allocUnsafe(this, arg)
        }
        return from(this, arg, encodingOrOffset, length)
      }

      Buffer.poolSize = 8192;
      Buffer._augment = function (arr) {
        arr.__proto__ = Buffer.prototype;
        return arr
      };

      function from(that, value, encodingOrOffset, length) {
        if (typeof value === "number") {
          throw new TypeError('"value" argument must not be a number')
        }
        if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
          return fromArrayBuffer(that, value, encodingOrOffset, length)
        }
        if (typeof value === "string") {
          return fromString(that, value, encodingOrOffset)
        }
        return fromObject(that, value)
      }

      Buffer.from = function (value, encodingOrOffset, length) {
        return from(null, value, encodingOrOffset, length)
      };
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        Buffer.prototype.__proto__ = Uint8Array.prototype;
        Buffer.__proto__ = Uint8Array;
        if (typeof Symbol !== "undefined" && Symbol.species && Buffer[Symbol.species] === Buffer) {
          Object.defineProperty(Buffer, Symbol.species, {value: null, configurable: true})
        }
      }

      function assertSize(size) {
        if (typeof size !== "number") {
          throw new TypeError('"size" argument must be a number')
        } else if (size < 0) {
          throw new RangeError('"size" argument must not be negative')
        }
      }

      function alloc(that, size, fill, encoding) {
        assertSize(size);
        if (size <= 0) {
          return createBuffer(that, size)
        }
        if (fill !== undefined) {
          return typeof encoding === "string" ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill)
        }
        return createBuffer(that, size)
      }

      Buffer.alloc = function (size, fill, encoding) {
        return alloc(null, size, fill, encoding)
      };

      function allocUnsafe(that, size) {
        assertSize(size);
        that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
        if (!Buffer.TYPED_ARRAY_SUPPORT) {
          for (var i = 0; i < size; ++i) {
            that[i] = 0
          }
        }
        return that
      }

      Buffer.allocUnsafe = function (size) {
        return allocUnsafe(null, size)
      };
      Buffer.allocUnsafeSlow = function (size) {
        return allocUnsafe(null, size)
      };

      function fromString(that, string, encoding) {
        if (typeof encoding !== "string" || encoding === "") {
          encoding = "utf8"
        }
        if (!Buffer.isEncoding(encoding)) {
          throw new TypeError('"encoding" must be a valid string encoding')
        }
        var length = byteLength(string, encoding) | 0;
        that = createBuffer(that, length);
        var actual = that.write(string, encoding);
        if (actual !== length) {
          that = that.slice(0, actual)
        }
        return that
      }

      function fromArrayLike(that, array) {
        var length = array.length < 0 ? 0 : checked(array.length) | 0;
        that = createBuffer(that, length);
        for (var i = 0; i < length; i += 1) {
          that[i] = array[i] & 255
        }
        return that
      }

      function fromArrayBuffer(that, array, byteOffset, length) {
        array.byteLength;
        if (byteOffset < 0 || array.byteLength < byteOffset) {
          throw new RangeError("'offset' is out of bounds")
        }
        if (array.byteLength < byteOffset + (length || 0)) {
          throw new RangeError("'length' is out of bounds")
        }
        if (byteOffset === undefined && length === undefined) {
          array = new Uint8Array(array)
        } else if (length === undefined) {
          array = new Uint8Array(array, byteOffset)
        } else {
          array = new Uint8Array(array, byteOffset, length)
        }
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          that = array;
          that.__proto__ = Buffer.prototype
        } else {
          that = fromArrayLike(that, array)
        }
        return that
      }

      function fromObject(that, obj) {
        if (Buffer.isBuffer(obj)) {
          var len = checked(obj.length) | 0;
          that = createBuffer(that, len);
          if (that.length === 0) {
            return that
          }
          obj.copy(that, 0, 0, len);
          return that
        }
        if (obj) {
          if (typeof ArrayBuffer !== "undefined" && obj.buffer instanceof ArrayBuffer || "length" in obj) {
            if (typeof obj.length !== "number" || isnan(obj.length)) {
              return createBuffer(that, 0)
            }
            return fromArrayLike(that, obj)
          }
          if (obj.type === "Buffer" && isArray(obj.data)) {
            return fromArrayLike(that, obj.data)
          }
        }
        throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")
      }

      function checked(length) {
        if (length >= kMaxLength()) {
          throw new RangeError("Attempt to allocate Buffer larger than maximum " + "size: 0x" + kMaxLength().toString(16) + " bytes")
        }
        return length | 0
      }

      function SlowBuffer(length) {
        if (+length != length) {
          length = 0
        }
        return Buffer.alloc(+length)
      }

      Buffer.isBuffer = function isBuffer(b) {
        return !!(b != null && b._isBuffer)
      };
      Buffer.compare = function compare(a, b) {
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
          throw new TypeError("Arguments must be Buffers")
        }
        if (a === b) return 0;
        var x = a.length;
        var y = b.length;
        for (var i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0
      };
      Buffer.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case"hex":
          case"utf8":
          case"utf-8":
          case"ascii":
          case"latin1":
          case"binary":
          case"base64":
          case"ucs2":
          case"ucs-2":
          case"utf16le":
          case"utf-16le":
            return true;
          default:
            return false
        }
      };
      Buffer.concat = function concat(list, length) {
        if (!isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        }
        if (list.length === 0) {
          return Buffer.alloc(0)
        }
        var i;
        if (length === undefined) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length
          }
        }
        var buffer = Buffer.allocUnsafe(length);
        var pos = 0;
        for (i = 0; i < list.length; ++i) {
          var buf = list[i];
          if (!Buffer.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers')
          }
          buf.copy(buffer, pos);
          pos += buf.length
        }
        return buffer
      };

      function byteLength(string, encoding) {
        if (Buffer.isBuffer(string)) {
          return string.length
        }
        if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "function" && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
          return string.byteLength
        }
        if (typeof string !== "string") {
          string = "" + string
        }
        var len = string.length;
        if (len === 0) return 0;
        var loweredCase = false;
        for (; ;) {
          switch (encoding) {
            case"ascii":
            case"latin1":
            case"binary":
              return len;
            case"utf8":
            case"utf-8":
            case undefined:
              return utf8ToBytes(string).length;
            case"ucs2":
            case"ucs-2":
            case"utf16le":
            case"utf-16le":
              return len * 2;
            case"hex":
              return len >>> 1;
            case"base64":
              return base64ToBytes(string).length;
            default:
              if (loweredCase) return utf8ToBytes(string).length;
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true
          }
        }
      }

      Buffer.byteLength = byteLength;

      function slowToString(encoding, start, end) {
        var loweredCase = false;
        if (start === undefined || start < 0) {
          start = 0
        }
        if (start > this.length) {
          return ""
        }
        if (end === undefined || end > this.length) {
          end = this.length
        }
        if (end <= 0) {
          return ""
        }
        end >>>= 0;
        start >>>= 0;
        if (end <= start) {
          return ""
        }
        if (!encoding) encoding = "utf8";
        while (true) {
          switch (encoding) {
            case"hex":
              return hexSlice(this, start, end);
            case"utf8":
            case"utf-8":
              return utf8Slice(this, start, end);
            case"ascii":
              return asciiSlice(this, start, end);
            case"latin1":
            case"binary":
              return latin1Slice(this, start, end);
            case"base64":
              return base64Slice(this, start, end);
            case"ucs2":
            case"ucs-2":
            case"utf16le":
            case"utf-16le":
              return utf16leSlice(this, start, end);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = (encoding + "").toLowerCase();
              loweredCase = true
          }
        }
      }

      Buffer.prototype._isBuffer = true;

      function swap(b, n, m) {
        var i = b[n];
        b[n] = b[m];
        b[m] = i
      }

      Buffer.prototype.swap16 = function swap16() {
        var len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits")
        }
        for (var i = 0; i < len; i += 2) {
          swap(this, i, i + 1)
        }
        return this
      };
      Buffer.prototype.swap32 = function swap32() {
        var len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits")
        }
        for (var i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2)
        }
        return this
      };
      Buffer.prototype.swap64 = function swap64() {
        var len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits")
        }
        for (var i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4)
        }
        return this
      };
      Buffer.prototype.toString = function toString() {
        var length = this.length | 0;
        if (length === 0) return "";
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments)
      };
      Buffer.prototype.equals = function equals(b) {
        if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return Buffer.compare(this, b) === 0
      };
      Buffer.prototype.inspect = function inspect() {
        var str = "";
        var max = exports.INSPECT_MAX_BYTES;
        if (this.length > 0) {
          str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
          if (this.length > max) str += " ... "
        }
        return "<Buffer " + str + ">"
      };
      Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (!Buffer.isBuffer(target)) {
          throw new TypeError("Argument must be a Buffer")
        }
        if (start === undefined) {
          start = 0
        }
        if (end === undefined) {
          end = target ? target.length : 0
        }
        if (thisStart === undefined) {
          thisStart = 0
        }
        if (thisEnd === undefined) {
          thisEnd = this.length
        }
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError("out of range index")
        }
        if (thisStart >= thisEnd && start >= end) {
          return 0
        }
        if (thisStart >= thisEnd) {
          return -1
        }
        if (start >= end) {
          return 1
        }
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        var x = thisEnd - thisStart;
        var y = end - start;
        var len = Math.min(x, y);
        var thisCopy = this.slice(thisStart, thisEnd);
        var targetCopy = target.slice(start, end);
        for (var i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0
      };

      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (buffer.length === 0) return -1;
        if (typeof byteOffset === "string") {
          encoding = byteOffset;
          byteOffset = 0
        } else if (byteOffset > 2147483647) {
          byteOffset = 2147483647
        } else if (byteOffset < -2147483648) {
          byteOffset = -2147483648
        }
        byteOffset = +byteOffset;
        if (isNaN(byteOffset)) {
          byteOffset = dir ? 0 : buffer.length - 1
        }
        if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
        if (byteOffset >= buffer.length) {
          if (dir) return -1; else byteOffset = buffer.length - 1
        } else if (byteOffset < 0) {
          if (dir) byteOffset = 0; else return -1
        }
        if (typeof val === "string") {
          val = Buffer.from(val, encoding)
        }
        if (Buffer.isBuffer(val)) {
          if (val.length === 0) {
            return -1
          }
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
        } else if (typeof val === "number") {
          val = val & 255;
          if (Buffer.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === "function") {
            if (dir) {
              return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
            } else {
              return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
            }
          }
          return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
        }
        throw new TypeError("val must be string, number or Buffer")
      }

      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        var indexSize = 1;
        var arrLength = arr.length;
        var valLength = val.length;
        if (encoding !== undefined) {
          encoding = String(encoding).toLowerCase();
          if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            if (arr.length < 2 || val.length < 2) {
              return -1
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2
          }
        }

        function read(buf, i) {
          if (indexSize === 1) {
            return buf[i]
          } else {
            return buf.readUInt16BE(i * indexSize)
          }
        }

        var i;
        if (dir) {
          var foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1) foundIndex = i;
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
            } else {
              if (foundIndex !== -1) i -= i - foundIndex;
              foundIndex = -1
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
          for (i = byteOffset; i >= 0; i--) {
            var found = true;
            for (var j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break
              }
            }
            if (found) return i
          }
        }
        return -1
      }

      Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1
      };
      Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
      };
      Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
      };

      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        var remaining = buf.length - offset;
        if (!length) {
          length = remaining
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining
          }
        }
        var strLen = string.length;
        if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");
        if (length > strLen / 2) {
          length = strLen / 2
        }
        for (var i = 0; i < length; ++i) {
          var parsed = parseInt(string.substr(i * 2, 2), 16);
          if (isNaN(parsed)) return i;
          buf[offset + i] = parsed
        }
        return i
      }

      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
      }

      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length)
      }

      function latin1Write(buf, string, offset, length) {
        return asciiWrite(buf, string, offset, length)
      }

      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length)
      }

      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
      }

      Buffer.prototype.write = function write(string, offset, length, encoding) {
        if (offset === undefined) {
          encoding = "utf8";
          length = this.length;
          offset = 0
        } else if (length === undefined && typeof offset === "string") {
          encoding = offset;
          length = this.length;
          offset = 0
        } else if (isFinite(offset)) {
          offset = offset | 0;
          if (isFinite(length)) {
            length = length | 0;
            if (encoding === undefined) encoding = "utf8"
          } else {
            encoding = length;
            length = undefined
          }
        } else {
          throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported")
        }
        var remaining = this.length - offset;
        if (length === undefined || length > remaining) length = remaining;
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds")
        }
        if (!encoding) encoding = "utf8";
        var loweredCase = false;
        for (; ;) {
          switch (encoding) {
            case"hex":
              return hexWrite(this, string, offset, length);
            case"utf8":
            case"utf-8":
              return utf8Write(this, string, offset, length);
            case"ascii":
              return asciiWrite(this, string, offset, length);
            case"latin1":
            case"binary":
              return latin1Write(this, string, offset, length);
            case"base64":
              return base64Write(this, string, offset, length);
            case"ucs2":
            case"ucs-2":
            case"utf16le":
            case"utf-16le":
              return ucs2Write(this, string, offset, length);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true
          }
        }
      };
      Buffer.prototype.toJSON = function toJSON() {
        return {type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0)}
      };

      function base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf)
        } else {
          return base64.fromByteArray(buf.slice(start, end))
        }
      }

      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        var res = [];
        var i = start;
        while (i < end) {
          var firstByte = buf[i];
          var codePoint = null;
          var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 128) {
                  codePoint = firstByte
                }
                break;
              case 2:
                secondByte = buf[i + 1];
                if ((secondByte & 192) === 128) {
                  tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                  if (tempCodePoint > 127) {
                    codePoint = tempCodePoint
                  }
                }
                break;
              case 3:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                  if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                    codePoint = tempCodePoint
                  }
                }
                break;
              case 4:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                fourthByte = buf[i + 3];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                  if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                    codePoint = tempCodePoint
                  }
                }
            }
          }
          if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023
          }
          res.push(codePoint);
          i += bytesPerSequence
        }
        return decodeCodePointsArray(res)
      }

      var MAX_ARGUMENTS_LENGTH = 4096;

      function decodeCodePointsArray(codePoints) {
        var len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints)
        }
        var res = "";
        var i = 0;
        while (i < len) {
          res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH))
        }
        return res
      }

      function asciiSlice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 127)
        }
        return ret
      }

      function latin1Slice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i])
        }
        return ret
      }

      function hexSlice(buf, start, end) {
        var len = buf.length;
        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;
        var out = "";
        for (var i = start; i < end; ++i) {
          out += toHex(buf[i])
        }
        return out
      }

      function utf16leSlice(buf, start, end) {
        var bytes = buf.slice(start, end);
        var res = "";
        for (var i = 0; i < bytes.length; i += 2) {
          res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
        }
        return res
      }

      Buffer.prototype.slice = function slice(start, end) {
        var len = this.length;
        start = ~~start;
        end = end === undefined ? len : ~~end;
        if (start < 0) {
          start += len;
          if (start < 0) start = 0
        } else if (start > len) {
          start = len
        }
        if (end < 0) {
          end += len;
          if (end < 0) end = 0
        } else if (end > len) {
          end = len
        }
        if (end < start) end = start;
        var newBuf;
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          newBuf = this.subarray(start, end);
          newBuf.__proto__ = Buffer.prototype
        } else {
          var sliceLen = end - start;
          newBuf = new Buffer(sliceLen, undefined);
          for (var i = 0; i < sliceLen; ++i) {
            newBuf[i] = this[i + start]
          }
        }
        return newBuf
      };

      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length")
      }

      Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
        offset = offset | 0;
        byteLength = byteLength | 0;
        if (!noAssert) checkOffset(offset, byteLength, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 256)) {
          val += this[offset + i] * mul
        }
        return val
      };
      Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
        offset = offset | 0;
        byteLength = byteLength | 0;
        if (!noAssert) {
          checkOffset(offset, byteLength, this.length)
        }
        var val = this[offset + --byteLength];
        var mul = 1;
        while (byteLength > 0 && (mul *= 256)) {
          val += this[offset + --byteLength] * mul
        }
        return val
      };
      Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset]
      };
      Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8
      };
      Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1]
      };
      Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216
      };
      Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3])
      };
      Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
        offset = offset | 0;
        byteLength = byteLength | 0;
        if (!noAssert) checkOffset(offset, byteLength, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 256)) {
          val += this[offset + i] * mul
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength);
        return val
      };
      Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
        offset = offset | 0;
        byteLength = byteLength | 0;
        if (!noAssert) checkOffset(offset, byteLength, this.length);
        var i = byteLength;
        var mul = 1;
        var val = this[offset + --i];
        while (i > 0 && (mul *= 256)) {
          val += this[offset + --i] * mul
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength);
        return val
      };
      Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 128)) return this[offset];
        return (255 - this[offset] + 1) * -1
      };
      Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 2, this.length);
        var val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val
      };
      Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 2, this.length);
        var val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val
      };
      Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24
      };
      Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]
      };
      Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4)
      };
      Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4)
      };
      Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8)
      };
      Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8)
      };

      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range")
      }

      Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset = offset | 0;
        byteLength = byteLength | 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0)
        }
        var mul = 1;
        var i = 0;
        this[offset] = value & 255;
        while (++i < byteLength && (mul *= 256)) {
          this[offset + i] = value / mul & 255
        }
        return offset + byteLength
      };
      Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset = offset | 0;
        byteLength = byteLength | 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0)
        }
        var i = byteLength - 1;
        var mul = 1;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          this[offset + i] = value / mul & 255
        }
        return offset + byteLength
      };
      Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
        if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
        this[offset] = value & 255;
        return offset + 1
      };

      function objectWriteUInt16(buf, value, offset, littleEndian) {
        if (value < 0) value = 65535 + value + 1;
        for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
          buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8
        }
      }

      Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8
        } else {
          objectWriteUInt16(this, value, offset, true)
        }
        return offset + 2
      };
      Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = value & 255
        } else {
          objectWriteUInt16(this, value, offset, false)
        }
        return offset + 2
      };

      function objectWriteUInt32(buf, value, offset, littleEndian) {
        if (value < 0) value = 4294967295 + value + 1;
        for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
          buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 255
        }
      }

      Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset + 3] = value >>> 24;
          this[offset + 2] = value >>> 16;
          this[offset + 1] = value >>> 8;
          this[offset] = value & 255
        } else {
          objectWriteUInt32(this, value, offset, true)
        }
        return offset + 4
      };
      Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = value & 255
        } else {
          objectWriteUInt32(this, value, offset, false)
        }
        return offset + 4
      };
      Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);
          checkInt(this, value, offset, byteLength, limit - 1, -limit)
        }
        var i = 0;
        var mul = 1;
        var sub = 0;
        this[offset] = value & 255;
        while (++i < byteLength && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1
          }
          this[offset + i] = (value / mul >> 0) - sub & 255
        }
        return offset + byteLength
      };
      Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);
          checkInt(this, value, offset, byteLength, limit - 1, -limit)
        }
        var i = byteLength - 1;
        var mul = 1;
        var sub = 0;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1
          }
          this[offset + i] = (value / mul >> 0) - sub & 255
        }
        return offset + byteLength
      };
      Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
        if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
        if (value < 0) value = 255 + value + 1;
        this[offset] = value & 255;
        return offset + 1
      };
      Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8
        } else {
          objectWriteUInt16(this, value, offset, true)
        }
        return offset + 2
      };
      Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = value & 255
        } else {
          objectWriteUInt16(this, value, offset, false)
        }
        return offset + 2
      };
      Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8;
          this[offset + 2] = value >>> 16;
          this[offset + 3] = value >>> 24
        } else {
          objectWriteUInt32(this, value, offset, true)
        }
        return offset + 4
      };
      Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (value < 0) value = 4294967295 + value + 1;
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = value & 255
        } else {
          objectWriteUInt32(this, value, offset, false)
        }
        return offset + 4
      };

      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range")
      }

      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22)
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4
      }

      Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert)
      };
      Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert)
      };

      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292)
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8
      }

      Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert)
      };
      Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert)
      };
      Buffer.prototype.copy = function copy(target, targetStart, start, end) {
        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (targetStart >= target.length) targetStart = target.length;
        if (!targetStart) targetStart = 0;
        if (end > 0 && end < start) end = start;
        if (end === start) return 0;
        if (target.length === 0 || this.length === 0) return 0;
        if (targetStart < 0) {
          throw new RangeError("targetStart out of bounds")
        }
        if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        if (end > this.length) end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start
        }
        var len = end - start;
        var i;
        if (this === target && start < targetStart && targetStart < end) {
          for (i = len - 1; i >= 0; --i) {
            target[i + targetStart] = this[i + start]
          }
        } else if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) {
          for (i = 0; i < len; ++i) {
            target[i + targetStart] = this[i + start]
          }
        } else {
          Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart)
        }
        return len
      };
      Buffer.prototype.fill = function fill(val, start, end, encoding) {
        if (typeof val === "string") {
          if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length
          } else if (typeof end === "string") {
            encoding = end;
            end = this.length
          }
          if (val.length === 1) {
            var code = val.charCodeAt(0);
            if (code < 256) {
              val = code
            }
          }
          if (encoding !== undefined && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string")
          }
          if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding)
          }
        } else if (typeof val === "number") {
          val = val & 255
        }
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError("Out of range index")
        }
        if (end <= start) {
          return this
        }
        start = start >>> 0;
        end = end === undefined ? this.length : end >>> 0;
        if (!val) val = 0;
        var i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val
          }
        } else {
          var bytes = Buffer.isBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
          var len = bytes.length;
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len]
          }
        }
        return this
      };
      var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

      function base64clean(str) {
        str = stringtrim(str).replace(INVALID_BASE64_RE, "");
        if (str.length < 2) return "";
        while (str.length % 4 !== 0) {
          str = str + "="
        }
        return str
      }

      function stringtrim(str) {
        if (str.trim) return str.trim();
        return str.replace(/^\s+|\s+$/g, "")
      }

      function toHex(n) {
        if (n < 16) return "0" + n.toString(16);
        return n.toString(16)
      }

      function utf8ToBytes(string, units) {
        units = units || Infinity;
        var codePoint;
        var length = string.length;
        var leadSurrogate = null;
        var bytes = [];
        for (var i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue
              } else if (i + 1 === length) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue
              }
              leadSurrogate = codePoint;
              continue
            }
            if (codePoint < 56320) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536
          } else if (leadSurrogate) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189)
          }
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint)
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128)
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128)
          } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128)
          } else {
            throw new Error("Invalid code point")
          }
        }
        return bytes
      }

      function asciiToBytes(str) {
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          byteArray.push(str.charCodeAt(i) & 255)
        }
        return byteArray
      }

      function utf16leToBytes(str, units) {
        var c, hi, lo;
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi)
        }
        return byteArray
      }

      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str))
      }

      function blitBuffer(src, dst, offset, length) {
        for (var i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i]
        }
        return i
      }

      function isnan(val) {
        return val !== val
      }
    }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
  }, {"base64-js": 16, ieee754: 19, isarray: 20}], 18: [function (require, module, exports) {
    (function (process, global) {
      (function (global, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : global.ES6Promise = factory()
      })(this, function () {
        "use strict";

        function objectOrFunction(x) {
          var type = typeof x;
          return x !== null && (type === "object" || type === "function")
        }

        function isFunction(x) {
          return typeof x === "function"
        }

        var _isArray = void 0;
        if (Array.isArray) {
          _isArray = Array.isArray
        } else {
          _isArray = function (x) {
            return Object.prototype.toString.call(x) === "[object Array]"
          }
        }
        var isArray = _isArray;
        var len = 0;
        var vertxNext = void 0;
        var customSchedulerFn = void 0;
        var asap = function asap(callback, arg) {
          queue[len] = callback;
          queue[len + 1] = arg;
          len += 2;
          if (len === 2) {
            if (customSchedulerFn) {
              customSchedulerFn(flush)
            } else {
              scheduleFlush()
            }
          }
        };

        function setScheduler(scheduleFn) {
          customSchedulerFn = scheduleFn
        }

        function setAsap(asapFn) {
          asap = asapFn
        }

        var browserWindow = typeof window !== "undefined" ? window : undefined;
        var browserGlobal = browserWindow || {};
        var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
        var isNode = typeof self === "undefined" && typeof process !== "undefined" && {}.toString.call(process) === "[object process]";
        var isWorker = typeof Uint8ClampedArray !== "undefined" && typeof importScripts !== "undefined" && typeof MessageChannel !== "undefined";

        function useNextTick() {
          return function () {
            return process.nextTick(flush)
          }
        }

        function useVertxTimer() {
          if (typeof vertxNext !== "undefined") {
            return function () {
              vertxNext(flush)
            }
          }
          return useSetTimeout()
        }

        function useMutationObserver() {
          var iterations = 0;
          var observer = new BrowserMutationObserver(flush);
          var node = document.createTextNode("");
          observer.observe(node, {characterData: true});
          return function () {
            node.data = iterations = ++iterations % 2
          }
        }

        function useMessageChannel() {
          var channel = new MessageChannel;
          channel.port1.onmessage = flush;
          return function () {
            return channel.port2.postMessage(0)
          }
        }

        function useSetTimeout() {
          var globalSetTimeout = setTimeout;
          return function () {
            return globalSetTimeout(flush, 1)
          }
        }

        var queue = new Array(1e3);

        function flush() {
          for (var i = 0; i < len; i += 2) {
            var callback = queue[i];
            var arg = queue[i + 1];
            callback(arg);
            queue[i] = undefined;
            queue[i + 1] = undefined
          }
          len = 0
        }

        function attemptVertx() {
          try {
            var vertx = Function("return this")().require("vertx");
            vertxNext = vertx.runOnLoop || vertx.runOnContext;
            return useVertxTimer()
          } catch (e) {
            return useSetTimeout()
          }
        }

        var scheduleFlush = void 0;
        if (isNode) {
          scheduleFlush = useNextTick()
        } else if (BrowserMutationObserver) {
          scheduleFlush = useMutationObserver()
        } else if (isWorker) {
          scheduleFlush = useMessageChannel()
        } else if (browserWindow === undefined && typeof require === "function") {
          scheduleFlush = attemptVertx()
        } else {
          scheduleFlush = useSetTimeout()
        }

        function then(onFulfillment, onRejection) {
          var parent = this;
          var child = new this.constructor(noop);
          if (child[PROMISE_ID] === undefined) {
            makePromise(child)
          }
          var _state = parent._state;
          if (_state) {
            var callback = arguments[_state - 1];
            asap(function () {
              return invokeCallback(_state, child, callback, parent._result)
            })
          } else {
            subscribe(parent, child, onFulfillment, onRejection)
          }
          return child
        }

        function resolve$1(object) {
          var Constructor = this;
          if (object && typeof object === "object" && object.constructor === Constructor) {
            return object
          }
          var promise = new Constructor(noop);
          resolve(promise, object);
          return promise
        }

        var PROMISE_ID = Math.random().toString(36).substring(2);

        function noop() {
        }

        var PENDING = void 0;
        var FULFILLED = 1;
        var REJECTED = 2;
        var TRY_CATCH_ERROR = {error: null};

        function selfFulfillment() {
          return new TypeError("You cannot resolve a promise with itself")
        }

        function cannotReturnOwn() {
          return new TypeError("A promises callback cannot return that same promise.")
        }

        function getThen(promise) {
          try {
            return promise.then
          } catch (error) {
            TRY_CATCH_ERROR.error = error;
            return TRY_CATCH_ERROR
          }
        }

        function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
          try {
            then$$1.call(value, fulfillmentHandler, rejectionHandler)
          } catch (e) {
            return e
          }
        }

        function handleForeignThenable(promise, thenable, then$$1) {
          asap(function (promise) {
            var sealed = false;
            var error = tryThen(then$$1, thenable, function (value) {
              if (sealed) {
                return
              }
              sealed = true;
              if (thenable !== value) {
                resolve(promise, value)
              } else {
                fulfill(promise, value)
              }
            }, function (reason) {
              if (sealed) {
                return
              }
              sealed = true;
              reject(promise, reason)
            }, "Settle: " + (promise._label || " unknown promise"));
            if (!sealed && error) {
              sealed = true;
              reject(promise, error)
            }
          }, promise)
        }

        function handleOwnThenable(promise, thenable) {
          if (thenable._state === FULFILLED) {
            fulfill(promise, thenable._result)
          } else if (thenable._state === REJECTED) {
            reject(promise, thenable._result)
          } else {
            subscribe(thenable, undefined, function (value) {
              return resolve(promise, value)
            }, function (reason) {
              return reject(promise, reason)
            })
          }
        }

        function handleMaybeThenable(promise, maybeThenable, then$$1) {
          if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
            handleOwnThenable(promise, maybeThenable)
          } else {
            if (then$$1 === TRY_CATCH_ERROR) {
              reject(promise, TRY_CATCH_ERROR.error);
              TRY_CATCH_ERROR.error = null
            } else if (then$$1 === undefined) {
              fulfill(promise, maybeThenable)
            } else if (isFunction(then$$1)) {
              handleForeignThenable(promise, maybeThenable, then$$1)
            } else {
              fulfill(promise, maybeThenable)
            }
          }
        }

        function resolve(promise, value) {
          if (promise === value) {
            reject(promise, selfFulfillment())
          } else if (objectOrFunction(value)) {
            handleMaybeThenable(promise, value, getThen(value))
          } else {
            fulfill(promise, value)
          }
        }

        function publishRejection(promise) {
          if (promise._onerror) {
            promise._onerror(promise._result)
          }
          publish(promise)
        }

        function fulfill(promise, value) {
          if (promise._state !== PENDING) {
            return
          }
          promise._result = value;
          promise._state = FULFILLED;
          if (promise._subscribers.length !== 0) {
            asap(publish, promise)
          }
        }

        function reject(promise, reason) {
          if (promise._state !== PENDING) {
            return
          }
          promise._state = REJECTED;
          promise._result = reason;
          asap(publishRejection, promise)
        }

        function subscribe(parent, child, onFulfillment, onRejection) {
          var _subscribers = parent._subscribers;
          var length = _subscribers.length;
          parent._onerror = null;
          _subscribers[length] = child;
          _subscribers[length + FULFILLED] = onFulfillment;
          _subscribers[length + REJECTED] = onRejection;
          if (length === 0 && parent._state) {
            asap(publish, parent)
          }
        }

        function publish(promise) {
          var subscribers = promise._subscribers;
          var settled = promise._state;
          if (subscribers.length === 0) {
            return
          }
          var child = void 0, callback = void 0, detail = promise._result;
          for (var i = 0; i < subscribers.length; i += 3) {
            child = subscribers[i];
            callback = subscribers[i + settled];
            if (child) {
              invokeCallback(settled, child, callback, detail)
            } else {
              callback(detail)
            }
          }
          promise._subscribers.length = 0
        }

        function tryCatch(callback, detail) {
          try {
            return callback(detail)
          } catch (e) {
            TRY_CATCH_ERROR.error = e;
            return TRY_CATCH_ERROR
          }
        }

        function invokeCallback(settled, promise, callback, detail) {
          var hasCallback = isFunction(callback), value = void 0, error = void 0, succeeded = void 0, failed = void 0;
          if (hasCallback) {
            value = tryCatch(callback, detail);
            if (value === TRY_CATCH_ERROR) {
              failed = true;
              error = value.error;
              value.error = null
            } else {
              succeeded = true
            }
            if (promise === value) {
              reject(promise, cannotReturnOwn());
              return
            }
          } else {
            value = detail;
            succeeded = true
          }
          if (promise._state !== PENDING) {
          } else if (hasCallback && succeeded) {
            resolve(promise, value)
          } else if (failed) {
            reject(promise, error)
          } else if (settled === FULFILLED) {
            fulfill(promise, value)
          } else if (settled === REJECTED) {
            reject(promise, value)
          }
        }

        function initializePromise(promise, resolver) {
          try {
            resolver(function resolvePromise(value) {
              resolve(promise, value)
            }, function rejectPromise(reason) {
              reject(promise, reason)
            })
          } catch (e) {
            reject(promise, e)
          }
        }

        var id = 0;

        function nextId() {
          return id++
        }

        function makePromise(promise) {
          promise[PROMISE_ID] = id++;
          promise._state = undefined;
          promise._result = undefined;
          promise._subscribers = []
        }

        function validationError() {
          return new Error("Array Methods must be provided an Array")
        }

        var Enumerator = function () {
          function Enumerator(Constructor, input) {
            this._instanceConstructor = Constructor;
            this.promise = new Constructor(noop);
            if (!this.promise[PROMISE_ID]) {
              makePromise(this.promise)
            }
            if (isArray(input)) {
              this.length = input.length;
              this._remaining = input.length;
              this._result = new Array(this.length);
              if (this.length === 0) {
                fulfill(this.promise, this._result)
              } else {
                this.length = this.length || 0;
                this._enumerate(input);
                if (this._remaining === 0) {
                  fulfill(this.promise, this._result)
                }
              }
            } else {
              reject(this.promise, validationError())
            }
          }

          Enumerator.prototype._enumerate = function _enumerate(input) {
            for (var i = 0; this._state === PENDING && i < input.length; i++) {
              this._eachEntry(input[i], i)
            }
          };
          Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
            var c = this._instanceConstructor;
            var resolve$$1 = c.resolve;
            if (resolve$$1 === resolve$1) {
              var _then = getThen(entry);
              if (_then === then && entry._state !== PENDING) {
                this._settledAt(entry._state, i, entry._result)
              } else if (typeof _then !== "function") {
                this._remaining--;
                this._result[i] = entry
              } else if (c === Promise$1) {
                var promise = new c(noop);
                handleMaybeThenable(promise, entry, _then);
                this._willSettleAt(promise, i)
              } else {
                this._willSettleAt(new c(function (resolve$$1) {
                  return resolve$$1(entry)
                }), i)
              }
            } else {
              this._willSettleAt(resolve$$1(entry), i)
            }
          };
          Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
            var promise = this.promise;
            if (promise._state === PENDING) {
              this._remaining--;
              if (state === REJECTED) {
                reject(promise, value)
              } else {
                this._result[i] = value
              }
            }
            if (this._remaining === 0) {
              fulfill(promise, this._result)
            }
          };
          Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
            var enumerator = this;
            subscribe(promise, undefined, function (value) {
              return enumerator._settledAt(FULFILLED, i, value)
            }, function (reason) {
              return enumerator._settledAt(REJECTED, i, reason)
            })
          };
          return Enumerator
        }();

        function all(entries) {
          return new Enumerator(this, entries).promise
        }

        function race(entries) {
          var Constructor = this;
          if (!isArray(entries)) {
            return new Constructor(function (_, reject) {
              return reject(new TypeError("You must pass an array to race."))
            })
          } else {
            return new Constructor(function (resolve, reject) {
              var length = entries.length;
              for (var i = 0; i < length; i++) {
                Constructor.resolve(entries[i]).then(resolve, reject)
              }
            })
          }
        }

        function reject$1(reason) {
          var Constructor = this;
          var promise = new Constructor(noop);
          reject(promise, reason);
          return promise
        }

        function needsResolver() {
          throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")
        }

        function needsNew() {
          throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")
        }

        var Promise$1 = function () {
          function Promise(resolver) {
            this[PROMISE_ID] = nextId();
            this._result = this._state = undefined;
            this._subscribers = [];
            if (noop !== resolver) {
              typeof resolver !== "function" && needsResolver();
              this instanceof Promise ? initializePromise(this, resolver) : needsNew()
            }
          }

          Promise.prototype.catch = function _catch(onRejection) {
            return this.then(null, onRejection)
          };
          Promise.prototype.finally = function _finally(callback) {
            var promise = this;
            var constructor = promise.constructor;
            return promise.then(function (value) {
              return constructor.resolve(callback()).then(function () {
                return value
              })
            }, function (reason) {
              return constructor.resolve(callback()).then(function () {
                throw reason
              })
            })
          };
          return Promise
        }();
        Promise$1.prototype.then = then;
        Promise$1.all = all;
        Promise$1.race = race;
        Promise$1.resolve = resolve$1;
        Promise$1.reject = reject$1;
        Promise$1._setScheduler = setScheduler;
        Promise$1._setAsap = setAsap;
        Promise$1._asap = asap;

        function polyfill() {
          var local = void 0;
          if (typeof global !== "undefined") {
            local = global
          } else if (typeof self !== "undefined") {
            local = self
          } else {
            try {
              local = Function("return this")()
            } catch (e) {
              throw new Error("polyfill failed because global object is unavailable in this environment")
            }
          }
          var P = local.Promise;
          if (P) {
            var promiseToString = null;
            try {
              promiseToString = Object.prototype.toString.call(P.resolve())
            } catch (e) {
            }
            if (promiseToString === "[object Promise]" && !P.cast) {
              return
            }
          }
          local.Promise = Promise$1
        }

        Promise$1.polyfill = polyfill;
        Promise$1.Promise = Promise$1;
        return Promise$1
      })
    }).call(this, require("_process"), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
  }, {_process: 22}], 19: [function (require, module, exports) {
    exports.read = function (buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      if (e === 0) {
        e = 1 - eBias
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    };
    exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2
        }
        if (e + eBias >= 1) {
          value += rt / c
        } else {
          value += rt * Math.pow(2, 1 - eBias)
        }
        if (value * c >= 2) {
          e++;
          c /= 2
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0
        }
      }
      for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
      }
      e = e << mLen | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
      }
      buffer[offset + i - d] |= s * 128
    }
  }, {}], 20: [function (require, module, exports) {
    var toString = {}.toString;
    module.exports = Array.isArray || function (arr) {
      return toString.call(arr) == "[object Array]"
    }
  }, {}], 21: [function (require, module, exports) {
    require("whatwg-fetch");
    module.exports = self.fetch.bind(self)
  }, {"whatwg-fetch": 23}], 22: [function (require, module, exports) {
    var process = module.exports = {};
    var cachedSetTimeout;
    var cachedClearTimeout;

    function defaultSetTimout() {
      throw new Error("setTimeout has not been defined")
    }

    function defaultClearTimeout() {
      throw new Error("clearTimeout has not been defined")
    }

    (function () {
      try {
        if (typeof setTimeout === "function") {
          cachedSetTimeout = setTimeout
        } else {
          cachedSetTimeout = defaultSetTimout
        }
      } catch (e) {
        cachedSetTimeout = defaultSetTimout
      }
      try {
        if (typeof clearTimeout === "function") {
          cachedClearTimeout = clearTimeout
        } else {
          cachedClearTimeout = defaultClearTimeout
        }
      } catch (e) {
        cachedClearTimeout = defaultClearTimeout
      }
    })();

    function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
        return setTimeout(fun, 0)
      }
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0)
      }
      try {
        return cachedSetTimeout(fun, 0)
      } catch (e) {
        try {
          return cachedSetTimeout.call(null, fun, 0)
        } catch (e) {
          return cachedSetTimeout.call(this, fun, 0)
        }
      }
    }

    function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
        return clearTimeout(marker)
      }
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker)
      }
      try {
        return cachedClearTimeout(marker)
      } catch (e) {
        try {
          return cachedClearTimeout.call(null, marker)
        } catch (e) {
          return cachedClearTimeout.call(this, marker)
        }
      }
    }

    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
      if (!draining || !currentQueue) {
        return
      }
      draining = false;
      if (currentQueue.length) {
        queue = currentQueue.concat(queue)
      } else {
        queueIndex = -1
      }
      if (queue.length) {
        drainQueue()
      }
    }

    function drainQueue() {
      if (draining) {
        return
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;
      var len = queue.length;
      while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
          if (currentQueue) {
            currentQueue[queueIndex].run()
          }
        }
        queueIndex = -1;
        len = queue.length
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout)
    }

    process.nextTick = function (fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
          args[i - 1] = arguments[i]
        }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
        runTimeout(drainQueue)
      }
    };

    function Item(fun, array) {
      this.fun = fun;
      this.array = array
    }

    Item.prototype.run = function () {
      this.fun.apply(null, this.array)
    };
    process.title = "browser";
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = "";
    process.versions = {};

    function noop() {
    }

    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.prependListener = noop;
    process.prependOnceListener = noop;
    process.listeners = function (name) {
      return []
    };
    process.binding = function (name) {
      throw new Error("process.binding is not supported")
    };
    process.cwd = function () {
      return "/"
    };
    process.chdir = function (dir) {
      throw new Error("process.chdir is not supported")
    };
    process.umask = function () {
      return 0
    }
  }, {}], 23: [function (require, module, exports) {
    (function (self) {
      "use strict";
      if (self.fetch) {
        return
      }
      var support = {
        searchParams: "URLSearchParams" in self,
        iterable: "Symbol" in self && "iterator" in Symbol,
        blob: "FileReader" in self && "Blob" in self && function () {
          try {
            new Blob;
            return true
          } catch (e) {
            return false
          }
        }(),
        formData: "FormData" in self,
        arrayBuffer: "ArrayBuffer" in self
      };
      if (support.arrayBuffer) {
        var viewClasses = ["[object Int8Array]", "[object Uint8Array]", "[object Uint8ClampedArray]", "[object Int16Array]", "[object Uint16Array]", "[object Int32Array]", "[object Uint32Array]", "[object Float32Array]", "[object Float64Array]"];
        var isDataView = function (obj) {
          return obj && DataView.prototype.isPrototypeOf(obj)
        };
        var isArrayBufferView = ArrayBuffer.isView || function (obj) {
          return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
        }
      }

      function normalizeName(name) {
        if (typeof name !== "string") {
          name = String(name)
        }
        if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
          throw new TypeError("Invalid character in header field name")
        }
        return name.toLowerCase()
      }

      function normalizeValue(value) {
        if (typeof value !== "string") {
          value = String(value)
        }
        return value
      }

      function iteratorFor(items) {
        var iterator = {
          next: function () {
            var value = items.shift();
            return {done: value === undefined, value: value}
          }
        };
        if (support.iterable) {
          iterator[Symbol.iterator] = function () {
            return iterator
          }
        }
        return iterator
      }

      function Headers(headers) {
        this.map = {};
        if (headers instanceof Headers) {
          headers.forEach(function (value, name) {
            this.append(name, value)
          }, this)
        } else if (Array.isArray(headers)) {
          headers.forEach(function (header) {
            this.append(header[0], header[1])
          }, this)
        } else if (headers) {
          Object.getOwnPropertyNames(headers).forEach(function (name) {
            this.append(name, headers[name])
          }, this)
        }
      }

      Headers.prototype.append = function (name, value) {
        name = normalizeName(name);
        value = normalizeValue(value);
        var oldValue = this.map[name];
        this.map[name] = oldValue ? oldValue + "," + value : value
      };
      Headers.prototype["delete"] = function (name) {
        delete this.map[normalizeName(name)]
      };
      Headers.prototype.get = function (name) {
        name = normalizeName(name);
        return this.has(name) ? this.map[name] : null
      };
      Headers.prototype.has = function (name) {
        return this.map.hasOwnProperty(normalizeName(name))
      };
      Headers.prototype.set = function (name, value) {
        this.map[normalizeName(name)] = normalizeValue(value)
      };
      Headers.prototype.forEach = function (callback, thisArg) {
        for (var name in this.map) {
          if (this.map.hasOwnProperty(name)) {
            callback.call(thisArg, this.map[name], name, this)
          }
        }
      };
      Headers.prototype.keys = function () {
        var items = [];
        this.forEach(function (value, name) {
          items.push(name)
        });
        return iteratorFor(items)
      };
      Headers.prototype.values = function () {
        var items = [];
        this.forEach(function (value) {
          items.push(value)
        });
        return iteratorFor(items)
      };
      Headers.prototype.entries = function () {
        var items = [];
        this.forEach(function (value, name) {
          items.push([name, value])
        });
        return iteratorFor(items)
      };
      if (support.iterable) {
        Headers.prototype[Symbol.iterator] = Headers.prototype.entries
      }

      function consumed(body) {
        if (body.bodyUsed) {
          return Promise.reject(new TypeError("Already read"))
        }
        body.bodyUsed = true
      }

      function fileReaderReady(reader) {
        return new Promise(function (resolve, reject) {
          reader.onload = function () {
            resolve(reader.result)
          };
          reader.onerror = function () {
            reject(reader.error)
          }
        })
      }

      function readBlobAsArrayBuffer(blob) {
        var reader = new FileReader;
        var promise = fileReaderReady(reader);
        reader.readAsArrayBuffer(blob);
        return promise
      }

      function readBlobAsText(blob) {
        var reader = new FileReader;
        var promise = fileReaderReady(reader);
        reader.readAsText(blob);
        return promise
      }

      function readArrayBufferAsText(buf) {
        var view = new Uint8Array(buf);
        var chars = new Array(view.length);
        for (var i = 0; i < view.length; i++) {
          chars[i] = String.fromCharCode(view[i])
        }
        return chars.join("")
      }

      function bufferClone(buf) {
        if (buf.slice) {
          return buf.slice(0)
        } else {
          var view = new Uint8Array(buf.byteLength);
          view.set(new Uint8Array(buf));
          return view.buffer
        }
      }

      function Body() {
        this.bodyUsed = false;
        this._initBody = function (body) {
          this._bodyInit = body;
          if (!body) {
            this._bodyText = ""
          } else if (typeof body === "string") {
            this._bodyText = body
          } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
            this._bodyBlob = body
          } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
            this._bodyFormData = body
          } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
            this._bodyText = body.toString()
          } else if (support.arrayBuffer && support.blob && isDataView(body)) {
            this._bodyArrayBuffer = bufferClone(body.buffer);
            this._bodyInit = new Blob([this._bodyArrayBuffer])
          } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
            this._bodyArrayBuffer = bufferClone(body)
          } else {
            throw new Error("unsupported BodyInit type")
          }
          if (!this.headers.get("content-type")) {
            if (typeof body === "string") {
              this.headers.set("content-type", "text/plain;charset=UTF-8")
            } else if (this._bodyBlob && this._bodyBlob.type) {
              this.headers.set("content-type", this._bodyBlob.type)
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
              this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8")
            }
          }
        };
        if (support.blob) {
          this.blob = function () {
            var rejected = consumed(this);
            if (rejected) {
              return rejected
            }
            if (this._bodyBlob) {
              return Promise.resolve(this._bodyBlob)
            } else if (this._bodyArrayBuffer) {
              return Promise.resolve(new Blob([this._bodyArrayBuffer]))
            } else if (this._bodyFormData) {
              throw new Error("could not read FormData body as blob")
            } else {
              return Promise.resolve(new Blob([this._bodyText]))
            }
          };
          this.arrayBuffer = function () {
            if (this._bodyArrayBuffer) {
              return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
            } else {
              return this.blob().then(readBlobAsArrayBuffer)
            }
          }
        }
        this.text = function () {
          var rejected = consumed(this);
          if (rejected) {
            return rejected
          }
          if (this._bodyBlob) {
            return readBlobAsText(this._bodyBlob)
          } else if (this._bodyArrayBuffer) {
            return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
          } else if (this._bodyFormData) {
            throw new Error("could not read FormData body as text")
          } else {
            return Promise.resolve(this._bodyText)
          }
        };
        if (support.formData) {
          this.formData = function () {
            return this.text().then(decode)
          }
        }
        this.json = function () {
          return this.text().then(JSON.parse)
        };
        return this
      }

      var methods = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];

      function normalizeMethod(method) {
        var upcased = method.toUpperCase();
        return methods.indexOf(upcased) > -1 ? upcased : method
      }

      function Request(input, options) {
        options = options || {};
        var body = options.body;
        if (input instanceof Request) {
          if (input.bodyUsed) {
            throw new TypeError("Already read")
          }
          this.url = input.url;
          this.credentials = input.credentials;
          if (!options.headers) {
            this.headers = new Headers(input.headers)
          }
          this.method = input.method;
          this.mode = input.mode;
          if (!body && input._bodyInit != null) {
            body = input._bodyInit;
            input.bodyUsed = true
          }
        } else {
          this.url = String(input)
        }
        this.credentials = options.credentials || this.credentials || "omit";
        if (options.headers || !this.headers) {
          this.headers = new Headers(options.headers)
        }
        this.method = normalizeMethod(options.method || this.method || "GET");
        this.mode = options.mode || this.mode || null;
        this.referrer = null;
        if ((this.method === "GET" || this.method === "HEAD") && body) {
          throw new TypeError("Body not allowed for GET or HEAD requests")
        }
        this._initBody(body)
      }

      Request.prototype.clone = function () {
        return new Request(this, {body: this._bodyInit})
      };

      function decode(body) {
        var form = new FormData;
        body.trim().split("&").forEach(function (bytes) {
          if (bytes) {
            var split = bytes.split("=");
            var name = split.shift().replace(/\+/g, " ");
            var value = split.join("=").replace(/\+/g, " ");
            form.append(decodeURIComponent(name), decodeURIComponent(value))
          }
        });
        return form
      }

      function parseHeaders(rawHeaders) {
        var headers = new Headers;
        var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, " ");
        preProcessedHeaders.split(/\r?\n/).forEach(function (line) {
          var parts = line.split(":");
          var key = parts.shift().trim();
          if (key) {
            var value = parts.join(":").trim();
            headers.append(key, value)
          }
        });
        return headers
      }

      Body.call(Request.prototype);

      function Response(bodyInit, options) {
        if (!options) {
          options = {}
        }
        this.type = "default";
        this.status = options.status === undefined ? 200 : options.status;
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = "statusText" in options ? options.statusText : "OK";
        this.headers = new Headers(options.headers);
        this.url = options.url || "";
        this._initBody(bodyInit)
      }

      Body.call(Response.prototype);
      Response.prototype.clone = function () {
        return new Response(this._bodyInit, {
          status: this.status,
          statusText: this.statusText,
          headers: new Headers(this.headers),
          url: this.url
        })
      };
      Response.error = function () {
        var response = new Response(null, {status: 0, statusText: ""});
        response.type = "error";
        return response
      };
      var redirectStatuses = [301, 302, 303, 307, 308];
      Response.redirect = function (url, status) {
        if (redirectStatuses.indexOf(status) === -1) {
          throw new RangeError("Invalid status code")
        }
        return new Response(null, {status: status, headers: {location: url}})
      };
      self.Headers = Headers;
      self.Request = Request;
      self.Response = Response;
      self.fetch = function (input, init) {
        return new Promise(function (resolve, reject) {
          var request = new Request(input, init);
          var xhr = new XMLHttpRequest;
          xhr.onload = function () {
            var options = {
              status: xhr.status,
              statusText: xhr.statusText,
              headers: parseHeaders(xhr.getAllResponseHeaders() || "")
            };
            options.url = "responseURL" in xhr ? xhr.responseURL : options.headers.get("X-Request-URL");
            var body = "response" in xhr ? xhr.response : xhr.responseText;
            resolve(new Response(body, options))
          };
          xhr.onerror = function () {
            reject(new TypeError("Network request failed"))
          };
          xhr.ontimeout = function () {
            reject(new TypeError("Network request failed"))
          };
          xhr.open(request.method, request.url, true);
          if (request.credentials === "include") {
            xhr.withCredentials = true
          } else if (request.credentials === "omit") {
            xhr.withCredentials = false
          }
          if ("responseType" in xhr && support.blob) {
            xhr.responseType = "blob"
          }
          request.headers.forEach(function (value, name) {
            xhr.setRequestHeader(name, value)
          });
          xhr.send(typeof request._bodyInit === "undefined" ? null : request._bodyInit)
        })
      };
      self.fetch.polyfill = true
    })(typeof self !== "undefined" ? self : this)
  }, {}]
}, {}, [1]);
