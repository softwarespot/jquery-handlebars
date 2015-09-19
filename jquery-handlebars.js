/* global Handlebars */

/*
 * jQuery-handlebars
 * https://github.com/softwarespot/jquery-handlebars
 * Author: softwarespot
 * Licensed under the MIT license
 * Version: 1.2.5
 */
; // jshint ignore:line
(function (window, $, undefined) {

    // Initial idea came from: http://blog.teamtreehouse.com/handlebars-js-part-3-tips-and-tricks

    // Plugin Logic

    $.fn.extend({
        // The parameter data doubles up as options when the action is either 'clear' or 'remove' i.e. options param will be ignored
        handlebars: function (action, template, dataOrOptions, options) {
            // jQuery object reference for this. Only select the first selector of the jQuery collection
            var $this = $(this).first();

            // Store whether the template is valid or invalid
            var isTemplateString = isString(template);

            // These actions don't require any pre-processing
            if (isString(action)) {
                // If a 'get' action is provided, then get the template(s)
                // The template string if not defined will return all template(s)
                if (/^FIND|GET$/i.test(action)) {
                    // The include parameter will be true, if the template is a string and valid anchor
                    return getTemplate($this, template, isTemplateString);
                    // If a 'compiled' action is provided, then return the compiled object literal
                } else if (/^COMPILED|STORE$/i.test(action)) {
                    // Shallow copy the compiled store, otherwise returning compiled would provide a reference and allow the
                    // end user to manipulate the internal store. Not a good idea if you ask me!
                    return $.extend({}, _compiled);
                }
            } else {
                // An invalid action was passed. It must be a string with a length greater than zero to be
                // considered valid
                return this;
            }

            // Set our options from the defaults, overriding with the
            // parameter we pass into this function
            options = $.extend({}, $.fn.handlebars.options, options);

            // START: Sanitize the options

            // Check if the option type is a string and valid
            if (isString(options.type) && /^APPEND|COMPILED|HTML|RAW$/i.test(options.type)) {
                // Set to uppercase
                options.type = options.type.toUpperCase();
            } else {
                // Otherwise default to 'append' i.e. if null or simply invalid
                options.type = _type.APPEND;
            }

            // If the removal type is a string and valid, then set to uppercase
            if (isString(options.remove_type) && /^ALL|NONE|SAME$/i.test(options.remove_type)) {
                // Set to uppercase
                options.remove_type = options.remove_type.toUpperCase();
            } else {
                // Otherwise default to 'none' i.e. if null or simply is invalid
                options.remove_type = _remove.NONE;
            }

            // END: Sanitize the options

            // If a 'clear' action is provided, then remove the template from the content element
            if (/^CLEAR|EMPTY|REMOVE$/i.test(action)) {
                // Extend the options again, as the dataOrOptions acts as an alias for options when a removal action is
                // specified
                options = $.extend(options, dataOrOptions);

                // If the options parameter is not the 'same' and a template string exists, the
                // temporarily override
                if (isTemplateString && options.remove_type !== _remove.SAME) {
                    options.remove_type = _remove.SAME;
                } else {
                    // Otherwise use 'all'
                    options.remove_type = _remove.ALL;
                }

                // If the template is not defined, then set as null before removing
                if (!isTemplateString) {
                    template = null;
                }

                return removeTemplate(this, $this, template, options);
            }

            // Assume it's an addition i.e. 'add'

            // The data object literal must contain data
            if (isBoolean(options.validate) && options.validate && $.isEmptyObject(dataOrOptions)) {
                return this;
            }

            // jQuery object reference
            var $selector = null;

            // If a valid string template is passed then check if it's compiled or get the jQuery object instead
            if (isTemplateString) {
                // If compiled already then no need to re-compile
                if ($.isFunction(_compiled[template])) {
                    // Return to continue chaining
                    return setTemplate(this, $this, template, dataOrOptions, options);
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
                    return setTemplate(this, $this, template, dataOrOptions, options);
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
            return setTemplate(this, $this, template, dataOrOptions, options);
        }

    });

    // Constants

    // The data-* attribute to distinguish a jQuery-handlebars template
    var DATA_ATTR = 'data-jquery-handlebars';

    // Removal constants. Who enjoys magic values?
    var _remove = {
        ALL: 'ALL',
        NONE: 'NONE',
        SAME: 'SAME'
    };

    // Type constants. Who enjoys magic values?
    var _type = {
        APPEND: 'APPEND',
        COMPILED: 'COMPILED',
        HTML: 'HTML',
        RAW: 'RAW'
    };

    // Fields (Private)

    // Store the compiled template(s) using the template string as the identifier i.e. key
    var _compiled = {};

    // Methods (Private)

    // Check if value is a boolean datatype
    function isBoolean(value) {
        return $.type(value) === 'boolean';
    }

    // Check if a value is a string datatype with a length greater than zero when whitespace is stripped
    function isString(value) {
        return $.type(value) === 'string' && value.trim().length > 0;
    }

    // Get the template in the content selector
    // include refers to whether to include the template in the selection
    function getTemplate($this, template, include) {
        // Get the divs with the template data attribute and optional specified template string e.g. #some-template
        var templateFind = (include && template ? '="' + sanitizeQuotes(template) + '"' : '');
        return $this.find('div[' + DATA_ATTR + templateFind + ']');
    }

    // Remove the specified template from the content selector. If a template is not provided
    // then all template(s) that are contained within the content selector will be removed
    function removeTemplate(_this, $this, template, options) {
        // If the option has been passed to remove 'none', then respect this choice or if the template is null but the option is set to 'same'
        if (options.remove_type === _remove.NONE || (template === null && options.remove_type === _remove.SAME)) {
            // Return this to maintain chaining if there is nothing to remove
            return _this;
        }

        // The include parameter will be set to true, when specifically looking for the provided template string
        var filtered = getTemplate($this, template, options.remove_type === _remove.SAME);
        if (filtered.length === 0) {
            // Return this to maintain chaining if there is nothing to remove
            return _this;
        }

        // Remove filtered nodes from the DOM
        filtered.remove();

        // Remove the template from the compiled store, if the option is true
        if (isBoolean(options.delete_compiled) && options.delete_compiled) {
            // Iterate through the filtered collection and remove the template string from the compiled store
            $.each(filtered, function (index, element) {
                // Get the data attribute for the template string if it's not null or has already been removed
                // var attribute = $(element).attr(DATA_ATTR);
                var attribute = element.getAttribute(DATA_ATTR); // Returns null or '' on error
                if (!attribute && _compiled[attribute] !== undefined) {
                    // Set to undefined to mimic deletion of the template. Using delete is not really required
                    _compiled[attribute] = undefined;
                }
            });
        }
    }

    // Replace double quotes with single quotes. Workaround for jQuery issue
    function sanitizeQuotes(value) {
        return value.replace(/"/g, '\'');
    }

    // Set the specified template to the content selector
    function setTemplate(_this, $this, template, data, options) {
        // Override deleting from the compiled stored before passing to removeTemplate
        options.delete_compiled = false;

        // Remove template(s)
        removeTemplate(_this, $this, template, options);

        // If set to not refill and template node(s) exist, then return this
        if (isBoolean(options.refill) && !options.refill) {
            // Get the template(s) after potential removal. The parameter include has been set to true, as we are checking
            // if only the same template(s) exists (perhaps an option could/should be created)
            var filtered = getTemplate($this, template, true);
            if (filtered.length > 0) {
                return _this;
            }
        }

        // Store the parsed template with data
        var parsedTemplate = _compiled[template](data);

        // Remove the compiled template from the store if specified
        if (isBoolean(options.store_compiled) && !options.store_compiled) {
            // Set to undefined to mimic deletion of the template. Using delete is not really required
            _compiled[template] = undefined;
        }

        // Append to the content element by checking the type. Default is 'append'
        switch (options.type) {
            case _type.COMPILED:
            case _type.RAW:
                // Return the compiled template
                return parsedTemplate;

            case _type.HTML:
                // Return as HTML data
                return $(parsedTemplate);

            default:
                // Create a div element with the template appended to it
                // This contains a data-* attribute called data-jquery-handlebars for easy association
                // that it's a Handlebars template
                var $div = $('<div/>')
                    .attr(DATA_ATTR, sanitizeQuotes(template))
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
        delete_compiled: true,

        // Store a compiled template. This improves efficiency if using the same template continuously. Accepts true (default) or false
        store_compiled: true,

        // Allow the addition of multiple template(s) inside a content element. Accepts true (default) or false
        refill: true,

        // Remove pre-existing compiled templates from the specified content element when adding/appending a template
        //
        // The following options are:
        //      'none' (default): Don't remove any template(s)
        //      'all': Remove all valid template(s) from the content element
        //      'same': Remove only those template(s) that match the provided template string
        remove_type: _remove.NONE,

        // How to output the compiled template to the specified content element
        //
        // The following options are:
        //      'append' (default): Append to the content element
        //      'html': Return a compiled template as HTML
        //      'compiled'/'raw': Return a compiled template
        type: _type.APPEND,

        // Check whether the data passed to the plugin is empty
        validate: true
    };
})(this, this.jQuery);
