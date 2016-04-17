/* global Handlebars */

/*
 * jQuery-handlebars
 * https://github.com/softwarespot/jquery-handlebars
 * Author: softwarespot
 * Licensed under the MIT license
 * Version: 1.3.7
 */
(function jQueryHandlebarsNamespace(window, document, $, Object) {
    // Initial idea came from: http://blog.teamtreehouse.com/handlebars-js-part-3-tips-and-tricks

    // Check if a value is null or undefined
    function _isNil(value) {
        return value === null || value === undefined;
    }

    // Check if jQuery exists
    if (_isNil($)) {
        return;
    }

    // Plugin Logic

    $.fn.extend({
        // The parameter data doubles up as options when the action is either 'clear' or 'remove' i.e. options param will be ignored
        handlebars: function handlebars(action, template, dataOrOptions, options) {
            if (!_isString(action)) {
                // An invalid action was passed. It must be a string with a length greater than zero to be
                // considered valid
                return this;
            }

            // jQuery object reference for this. Only select the first selector of the jQuery collection
            var $this = $(this).first();

            // Store whether the template is valid or invalid
            var isTemplateString = _isString(template);

            // These actions don't require any pre-processing

            // If a 'get' action is provided, then get the template(s)
            if (_reAjax.test(action)) {
                // Strip the AJAX- part from the action
                var url = action.replace(_reAjax, '');

                var promise = _load(url);

                // On successful resolution
                promise.then(function then() {
                    // Continue as normal with the template
                    $this.handlebars('ADD', template, dataOrOptions, options);
                });

                return this;
            } else if (_reGet.test(action)) {
                // The template string if not defined will return all template(s)

                // The include parameter will be true, if the template is a string and valid anchor
                return _getTemplate($this, template, isTemplateString);
            } else if (_reCompiled.test(action)) {
                // If a 'compiled' action is provided, then return the compiled object literal
                // Shallow copy the compiled store, otherwise returning compiled would provide a reference and allow the
                // end user to manipulate the internal store. Not a good idea if you ask me!
                return $.extend({}, _compiled);
            }

            // Set our options from the defaults, overriding with the
            // parameter we pass into this function
            options = $.extend({}, $.fn.handlebars.options, options);

            // eslint only workaround for checking old style properties
            options.deleteCompiled = options.delete_compiled || options.deleteCompiled;
            options.storeCompiled = options.store_compiled || options.storeCompiled;
            options.removeType = options.remove_type || options.removeType;

            // START: Sanitize the options

            // Check if the option type is a string and valid
            if (_isString(options.type) && _reType.test(options.type)) {
                // Set to upper-case
                options.type = options.type.toUpperCase();
            } else {
                // Otherwise default to 'append' i.e. if null or simply invalid
                options.type = _typeAppend;
            }

            // If the removal type is a string and valid, then set to uppercase
            if (_isString(options.removeType) && _reRemoveType.test(options.removeType)) {
                // Set to upper-case
                options.removeType = options.removeType.toUpperCase();
            } else {
                // Otherwise default to 'none' i.e. if null or simply is invalid
                options.removeType = _removeNone;
            }

            // END: Sanitize the options

            // If a 'clear' action is provided, then remove the template from the content element
            if (_reClear.test(action)) {
                // Extend the options again, as the dataOrOptions acts as an alias for options when a removal action is
                // specified
                options = $.extend(options, dataOrOptions);

                // If the options parameter is not the 'same' and a template string exists, the
                // temporarily override
                if (isTemplateString && options.removeType !== _removeSame) {
                    options.removeType = _removeSame;
                } else {
                    // Otherwise use 'all'
                    options.removeType = _removeAll;
                }

                // If the template is not defined, then set as null before removing
                if (!isTemplateString) {
                    template = null;
                }

                return _removeTemplate(this, $this, template, options);
            }

            // Assume it's an addition i.e. 'add'

            // The data object literal must contain data
            if (_isBoolean(options.validate) && options.validate && $.isEmptyObject(dataOrOptions)) {
                return this;
            }

            // jQuery object reference
            var $selector = null;

            // If a valid string template is passed then check if it's compiled or get the jQuery object instead
            if (isTemplateString) {
                // If compiled already then no need to re-compile
                if ($.isFunction(_compiled[template])) {
                    // Return to continue chaining
                    return _setTemplate(this, $this, template, dataOrOptions, options);
                }

                // Not compiled

                // Get the first selection only
                $selector = $(template).first();

                // If the selector doesn't exist for whatever reason, then set to null
                if ($selector.length === 0) {
                    $selector = null;
                }

                // If a valid jQuery selector object
            } else if (template instanceof $ && $.isNumeric(template.length) && template.length > 0) {
                // Get the first selection only
                $selector = template.first();

                // Get the selector name for using with the compiled object literal
                // If the selector property doesn't exist, then this will be set to null
                template = $selector.selector !== undefined ? $selector.selector : null;

                // If compiled already then no need to re-compile
                if ($.isFunction(_compiled[template])) {
                    // Return to continue chaining
                    return _setTemplate(this, $this, template, dataOrOptions, options);
                }
            }

            // If an invalid selector, then return this to continue chaining
            if ($selector === null || template === null || $selector.length === 0) {
                return this;
            }

            // Get the HTML of the template only
            var html = $selector.html();

            // Store the compiled template in the compiled store
            _compiled[template] = Handlebars.compile(html);

            // Return to continue chaining
            return _setTemplate(this, $this, template, dataOrOptions, options);
        },

    });

    // Constants

    // The data-* attribute to distinguish a jQuery-handlebars template
    var DATA_ATTRIBUTE_HANDLEBARS = 'data-jquery-handlebars';

    // Fields (Private)

    // Regular expressions
    var _reAjax = /^(?:AJAX-)/i;
    var _reClear = /^(?:CLEAR|EMPTY|REMOVE)$/i;
    var _reCompiled = /^(?:COMPILED|STORE)$/i;
    var _reDoubleQuote = /"/g;
    var _reGet = /^(?:FIND|GET)$/i;
    var _reRemoveType = /^(?:ALL|NONE|SAME)$/i;
    var _reType = /^(?:APPEND|COMPILED|HTML|RAW)$/i;

    // Removal constants. Who enjoys magic values?
    var _removeAll = 'ALL';
    var _removeNone = 'NONE';
    var _removeSame = 'SAME';

    // Type constants. Who enjoys magic values?
    var _typeAppend = 'APPEND';
    var _typeCompiled = 'COMPILED';
    var _typeHTML = 'HTML';
    var _typeRaw = 'RAW';

    var _$body;

    _nativeObjectCreate = Object.create;
    var _nativeObjectCreate = _isNil(_nativeObjectCreate) ? function _objectCreate() {
        return {};
    } : _nativeObjectCreate;

    // Store the compiled template(s) using the template string as the identifier i.e. key
    var _compiled = _nativeObjectCreate(null);

    // Store the external templates previously loaded
    var _externalUrls = _nativeObjectCreate(null);

    // Methods (Private)

    // Get the template in the content selector
    // include refers to whether to include the template in the selection
    function _getTemplate($this, template, include) {
        // Get the divs with the template data attribute and optional specified template string e.g. #some-template
        var templateFind = (include && template ? '="' + _sanitizeQuotes(template) + '"' : '');
        return $this.find('div[' + DATA_ATTRIBUTE_HANDLEBARS + templateFind + ']');
    }

    // Check if a value is a boolean datatype
    function _isBoolean(value) {
        return $.type(value) === 'boolean';
    }

    // Check if a value is a string datatype with a length greater than zero when whitespace is stripped
    function _isString(value) {
        return $.type(value) === 'string' && $.trim(value).length > 0;
    }

    // Load a script and append to the body of the current document
    function _load(url) {
        // Create a jQuery deferred object
        var defer = $.Deferred(function deferred(defer) { // eslint-disable-line new-cap
            if (!_isString(url)) {
                defer.reject();

                return;
            }

            // Check if the template was loaded before
            if (!_isNil(_externalUrls[url])) {
                defer.resolve();
            } else {
                if (_isNil(_$body) || _$body.length === 0) {
                    _$body = $('body');
                }

                // When the external template has has successfully loaded
                _$body.load(url, function load() {
                    defer.resolve();
                });
            }

            // Store the url
            _externalUrls[url] = url;
        });

        // Retrieve the promise interface so as not to expose resolve and reject
        return defer.promise();
    }

    // Remove the specified template from the content selector. If a template is not provided
    // then all template(s) that are contained within the content selector will be removed
    function _removeTemplate(_this, $this, template, options) {
        // If the option has been passed to remove 'none', then respect this choice or if the template is null but the option is set to 'same'
        if (options.removeType === _removeNone || (template === null && options.removeType === _removeSame)) {
            // Return this to maintain chaining if there is nothing to remove
            return _this;
        }

        // The include parameter will be set to true, when specifically looking for the provided template string
        var $filtered = _getTemplate($this, template, options.removeType === _removeSame);
        if ($filtered.length === 0) {
            // Return this to maintain chaining if there is nothing to remove
            return _this;
        }

        // Remove filtered nodes from the DOM
        $filtered.remove();

        // Remove the template from the compiled store, if the option is true
        if (_isBoolean(options.deleteCompiled) && options.deleteCompiled) {
            // Iterate through the filtered collection and remove the template string from the compiled store
            $filtered.each(function filteredEach(index, element) {
                // Get the data attribute for the template string if it's not null or has already been removed
                // var attribute = $(element).attr(DATA_ATTRIBUTE_HANDLEBARS);
                var attribute = element.getAttribute(DATA_ATTRIBUTE_HANDLEBARS); // Returns null or '' on error
                if (attribute && !_isNil(_compiled[attribute])) {
                    // Set to undefined to mimic deletion of the template. Using delete is not really required
                    _compiled[attribute] = undefined;
                }
            });
        }

        return _this;
    }

    // Replace double quotes with single quotes. Workaround for jQuery issue
    function _sanitizeQuotes(value) {
        return value.replace(_reDoubleQuote, '\'');
    }

    // Set the specified template to the content selector
    function _setTemplate(_this, $this, template, data, options) {
        // Override deleting from the compiled stored before passing to _removeTemplate
        options.deleteCompiled = false;

        // Remove template(s)
        _removeTemplate(_this, $this, template, options);

        // If set to not refill and template node(s) exist, then return this
        if (_isBoolean(options.refill) && !options.refill) {
            // Get the template(s) after potential removal. The parameter include has been set to true, as we are checking
            // if only the same template(s) exists (perhaps an option could/should be created)
            var filtered = _getTemplate($this, template, true);
            if (filtered.length > 0) {
                return _this;
            }
        }

        // Store the parsed template with data
        var parsedTemplate = _compiled[template](data);

        // Remove the compiled template from the store if specified
        if (_isBoolean(options.storeCompiled) && !options.storeCompiled) {
            // Set to undefined to mimic deletion of the template. Using delete is not really required
            _compiled[template] = undefined;
        }

        // Append to the content element by checking the type. Default is 'append'
        switch (options.type) {
            case _typeCompiled:
            case _typeRaw:

                // Return the compiled template
                return parsedTemplate;

            case _typeHTML:

                // Return as HTML data
                return $(parsedTemplate);

            default:

                // Create a div element with the template appended to it
                // This contains a data-* attribute called data-jquery-handlebars for easy association
                // that it's a Handlebars template
                var $div = $('<div/>')
                    .attr(DATA_ATTRIBUTE_HANDLEBARS, _sanitizeQuotes(template))
                    .append(parsedTemplate);

                // Append the div to content element
                $this.append($div);
                break;

        }

        return _this;
    }

    // Defaults

    $.fn.handlebars.options = {
        // Delete the template from the compiled store when a removal action is specified. Accepts true (default) or false
        deleteCompiled: true,

        // Store a compiled template. This improves efficiency if using the same template continuously. Accepts true (default) or false
        storeCompiled: true,

        // Allow the addition of multiple template(s) inside a content element. Accepts true (default) or false
        refill: true,

        // Remove pre-existing compiled templates from the specified content element when adding/appending a template
        //
        // The following options are:
        //      'none' (default): Don't remove any template(s)
        //      'all': Remove all valid template(s) from the content element
        //      'same': Remove only those template(s) that match the provided template string
        removeType: _removeNone,

        // How to output the compiled template to the specified content element
        //
        // The following options are:
        //      'append' (default): Append to the content element
        //      'html': Return a compiled template as HTML
        //      'compiled'/'raw': Return a compiled template
        type: _typeAppend,

        // Check whether the data passed to the plugin is empty
        validate: true,
    };
}(window, window.document, window.jQuery, window.Object));
