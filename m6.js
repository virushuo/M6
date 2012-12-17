var M6 = function() {
	var _simpleRoutes = [];
	var _paramRoutes = [];
	var _addGetRoute = function(url, action) {
		_addRoute(url, 'GET', action);
	};

	var _addPostRoute = function(url, action) {
		_addRoute(url, 'POST', action);
	};

	var _addRoute = function(url, method, action) {
		var item = {
			Url: url,
			Method: method,
			Action: action
		};
		if(url.indexOf('@') >= 0) {
			if(_isValidRoute(url)) {
				_paramRoutes.push(item);
			}
		} else {
			_simpleRoutes.push(item);
		}
	};

	var _isValidRoute = function(url) {
		var urlArray = url.split('/');
		var indexOfFirstParameterItem = -1;

		for(var i = 0, length = urlArray.length; i < length; i++) {
			if(urlArray[i][0] === '@' && indexOfFirstParameterItem < 0) {
				indexOfFirstParameterItem = i;
			}

			if(urlArray[i][0] !== '@' && indexOfFirstParameterItem >= 0) {
				return false;
			}
		}

		return true;
	};
  
	var _process = function(req, res) {
		var route = _getRoute(req);

		if(route) {
			var parameters = _getParameters(req, route);
			req.params = parameters;
			route.Action(req, res);
			return true;
		}

		return false;
	};

	var _getRoute = function(req) {
		var route = _getRouteStringMatch(req);

		if(route) {
			return route;
		}

		return _getRouteSplit(req);
	};

	var _getRouteStringMatch = function(req) {
		var url = req.url;

		if(url.indexOf('?') >= 0) {
			url = url.substr(0, url.indexOf('?'));
		}

		for(var i = 0, length = _simpleRoutes.length; i < length; i++) {
			if(_simpleRoutes[i].Url === url) {
				return _simpleRoutes[i];
			}
		}
	};

	var _getRouteSplit = function(req) {
		var urlArray = req.url.split('/');
		for(var i = 0, length = _paramRoutes.length; i < length; i++) {
			if(_isMatch(urlArray, req.method, _paramRoutes[i])) {
				return _paramRoutes[i];
			}
		}
	};

	var _isMatch = function(urlArray, method, route) {
		if(route.Method !== method) { return false; }

		var routeUrlArray = route.Url.split('/');

		var match = true;
		for(var i = 0, length = routeUrlArray.length; i < length; i++) {
			var item = urlArray[i];
			if(item && item.indexOf('?') >= 0) {
				item = item.substr(0, item.indexOf('?'));
			}

			if(routeUrlArray[i] !== item && routeUrlArray[i][0] !== '@') { match = false; }
		}
		return match;
	};

	var _getParameters = function(req, route) {
		var urlArray = req.url.split('/');
		var parameters = {};
		var routeUrlArray = route.Url.split('/');
		for(var i = 0, length = routeUrlArray.length; i < length; i++) {
			if(routeUrlArray[i][0] === '@') {
				var item = urlArray[i];
				if(item.indexOf('?') >= 0) {
					item = item.substring(0, item.indexOf('?'));
				}

				var key = routeUrlArray[i].substring(1);
				var value = item;
				parameters[key] = value;
			}
		}

		_getQueryStringParameters(req, parameters);

		return parameters;
	};

	var _getQueryStringParameters = function(req, parameters) {
		if(req.url.indexOf('?') < 0) {
			return [];
		}

		var parameterString = req.url.substr(req.url.indexOf('?') + 1);
		var parameterStrings = parameterString.split('&');
		for(var i = 0, length = parameterStrings.length; i < length; i++) {
			var items = parameterStrings[i].split('=');

			if(items[0]) {
				parameters[items[0]] = items[1];
			}
		}
	};

	return {
		AddRoute: _addRoute,
		AddGetRoute: _addGetRoute,
		AddPostRoute: _addPostRoute,
		Process: _process
	};
}();

module.exports = M6;