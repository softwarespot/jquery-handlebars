/* global jQuery, Handlebars */

/*
 * jQuery-handlebars
 * https://github.com/softwarespot/jquery-handlebars
 * Author: softwarespot
 * Licensed under the MIT license
 * Version: 1.1.2
 */
; (function ($, undefined) {

    // Initial idea by: http://blog.teamtreehouse.com/handlebars-js-part-3-tips-and-tricks

    // Plugin Logic

    $.fn.extend({

        // The parameter data doubles up as options when the action is either 'clear' or 'remove' i.e. options param will be ignored
        handlebars: function(action, template, dataOrOptions, options) {

            // jQuery object reference for this. Only select the first selector of the jQuery collection
            var $this = $(this).first(),

                // The following was taken from sizzle.js, URL: https://github.com/jquery/sizzle/blob/master/dist/sizzle.js

                // http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
                identifier = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+',

                // Create a regular expression object to test valid id fragments
                reIdentifier = new RegExp('^#' + identifier + '$'),

                // Store whether the template is valid or invalid
                isTemplateString = isString(template) && reIdentifier.test(template);

            // console.log('jQuery-handlebars: Is a template? [%s, %s]', template, isTemplateString);

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
                options.type = Type.APPEND;

            }

            // If the removal type is a string and valid, then set to uppercase
            if (isString(options.remove_type) && /^ALL|NONE|SAME$/i.test(options.remove_type)) {

                // Set to uppercase
                options.remove_type = options.remove_type.toUpperCase();

            } else {

                // Otherwise default to 'none' i.e. if null or simply is invalid
                options.remove_type = Remove.NONE;

            }

            // END: Sanitize the options

            // If a 'clear' action is provided, then remove the template from the content element
            if (/^CLEAR|EMPTY|REMOVE$/i.test(action)) {

                // Extend the options again, as the dataOrOptions acts as an alias for options when a removal action is
                // specified
                options = $.extend(options, dataOrOptions);

                // If the options parameter is not the 'same' and a template string exists, the
                // temporarily override
                if (isTemplateString && options.remove_type !== Remove.SAME) {

                    options.remove_type = Remove.SAME;

                } else {

                    // Otherwise use 'all'
                    options.remove_type = Remove.ALL;

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

                // console.log('jQuery-handlebars: Data was not passed to the plugin or is simply an empty plain object');
                return this;

            }

            // jQuery object reference
            var $selector = null;

            // If a valid string template is passed then check if it's compiled or get the jQuery object instead
            if (isTemplateString) {

                // If compiled already then no need to re-compile
                if ($.isFunction(_compiled[template])) {

                    // console.log('jQuery-handlebars: %s has already been compiled', template);

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

                    // console.log('jQuery-handlebars: %s has already been compiled', template);

                    // Return to continue chaining
                    return setTemplate(this, $this, template, dataOrOptions, options);

                }
            }

            // If an invalid selector, then return this to continue chaining
            if ($selector === null || template === null || $selector.length === 0) {

                // console.log('jQuery-handlebars: Template cannot be found');
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
    var DATA_ATTR = 'data-jquery-handlebars',

        // Removal constants. Who enjoys magic values?
        Remove = {
            ALL: 'ALL',
            NONE: 'NONE',
            SAME: 'SAME'
        },

        // Type constants. Who enjoys magic values?
        Type = {
            APPEND: 'APPEND',
            COMPILED: 'COMPILED',
            HTML: 'HTML',
            RAW: 'RAW'
        };

    // Fields (Private)

    // Store the compiled template(s) using the template string as the identifier i.e. key
    var _compiled = {};

    // Methods (Private)
    // Note: Variables are called 'self' to avoid conflict with 'this'

    // Check if value is a boolean datatype
    var isBoolean = function (value) {

        return $.type(value) === 'boolean';

    };

    // Check if a value is a string datatype with a length greater than zero when whitespace is stripped
    var isString = function (value) {

        return $.type(value) === 'string' && value.trim().length > 0;

    };

    // Get the template in the content selector
    // include refers to whether to include the template in the selection
    var getTemplate = function ($self, template, include) {

        // Get the divs with the template data attribute and optional specified template string e.g. #some-template
        var templateFind = (include && template ? '="' + template + '"' : '');
        return $self.find('div[' + DATA_ATTR + templateFind + ']');

    };

    // Remove the specified template from the content selector. If a template is not provided
    // then all template(s) that are contained within the content selector will be removed
    var removeTemplate = function (self, $self, template, options) {

        // If the option has been passed to remove 'none', then respect this choice or if the template is null but the option is set to 'same'
        if (options.remove_type === Remove.NONE || (template === null && options.remove_type === Remove.SAME)) {

            // console.log('jQuery-handlebars: Template(s) were not removed [%s]', options.remove_type);

            // Return self to maintain chaining if there is nothing to remove
            return self;

        }

        // The include parameter will be set to true, when specifically looking for the provided template string
        var filtered = getTemplate($self, template, options.remove_type === Remove.SAME);
        if (filtered.length === 0) {

            // console.log('jQuery-handlebars: Unable to find any template(s) for removal [%s]', options.remove_type);

            // Return self to maintain chaining if there is nothing to remove
            return self;

        }

        // Remove filtered nodes from the DOM
        filtered.remove();

        // console.log('jQuery-handlebars: Removing template(s) [%s]', options.remove_type);

        // Remove the template from the compiled store, if the option is true
        if (isBoolean(options.delete_compiled) && options.delete_compiled) {

            // Iterate through the filtered collection and remove the template string from the compiled store
            $.each(filtered, function(index, element) {

                // Get the data attribute for the template string if it's not null or has already been removed
                // var attribute = $(this).attr(DATA_ATTR);
                var attribute = this.getAttribute(DATA_ATTR); // Returns null or '' on error
                if (!attribute && _compiled[attribute] !== undefined) {

                    // Set to undefined to mimic deletion of the template. Using delete is not really required
                    _compiled[attribute] = undefined;

                    // console.log('jQuery-handlebars: Removing compiled template [%s]', attribute);

                }

            });

            // console.log('jQuery-handlebars: Removed the template from the compiled store [%s]', template);

        }

    };

    // Set the specified template to the content selector
    var setTemplate = function (self, $self, template, data, options) {

        // Override deleting from the compiled stored before passing to removeTemplate
        options.delete_compiled = false;

        // Remove template(s)
        removeTemplate(self, $self, template, options);

        // If set to not refill and template node(s) exist, then return this
        if (isBoolean(options.refill) && !options.refill) {

            // Get the template(s) after potential removal. The parameter include has been set to true, as we are checking
            // if only the same template(s) exists (perhaps an option could/should be created)
            var filtered = getTemplate($self, template, true);
            if (filtered.length > 0) {

                // console.log('jQuery-handlebars: Refill has been set to false and the content element contains template(s) [%s]', options.remove_type);

                return self;

            }

        }

        // Store the parsed template with data
        var parsedTemplate = _compiled[template](data);

        // Remove the compiled template from the store if specified
        if (isBoolean(options.store_compiled) && !options.store_compiled) {

            // Set to undefined to mimic deletion of the template. Using delete is not really required
            _compiled[template] = undefined;

            // console.log('jQuery-handlebars: Not stored in compiled storage [%s]', options.store_compiled);

        }

        // Append to the content element by checking the type. Default is 'append'
        switch (options.type) {
            case Type.COMPILED:
            case Type.RAW:

                // console.log('jQuery-handlebars: Returning raw HTML', template);

                // Return the compiled template
                return parsedTemplate;

            case Type.HTML:

                // console.log('jQuery-handlebars: Returning as HTML', template);

                // Return as HTML data
                return $(parsedTemplate);

            default:

                // Create a div element with the template appended to it
                // This contains a data-* attribute called data-jquery-handlebars for easy association
                // that it's a Handlebarjs template
                var $div = $('<div/>')
                    .attr(DATA_ATTR, template)
                    .append(parsedTemplate);

                // Append the div to content element
                $self.append($div);

                // console.log('jQuery-handlebars: Appending template to the content element [%s]', template);
                break;

        }

        return self;
    };

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
        remove_type: Remove.NONE,

        // How to output the compiled template to the specified content element
        //
        // The following options are:
        //      'append' (default): Append to the content element
        //      'html': Return a compiled template as HTML
        //      'compiled'/'raw': Return a compiled template
        type: Type.APPEND,

        // Check whether the data passed to the plugin is empty
        validate: true
    };

})(jQuery);
