/* global Handlebars */
/*
 * jQuery-handlebars
 * https://github.com/softwarespot/jquery-handlebars
 * Author: softwarespot
 * Licensed under the MIT license
 * Version: 0.1.0-beta
 */
; (function ($, undefined) {

    // Initial idea from: http://blog.teamtreehouse.com/handlebars-js-part-3-tips-and-tricks

    // Plugin Logic
    $.fn.extend({

        // data doubles up as options when the action is either 'clear' or 'remove'
        handlebars: function (action, template, dataOrOptions, options) {

            // jQuery object reference for this. Only select the first selector of the collection
            var $this = $(this).first(),

                // The following was taken from sizzle.js, URL: https://github.com/jquery/sizzle/blob/master/dist/sizzle.js

                // http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
                identifier = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+',

                rIdentifier = new RegExp('^#' + identifier + '$');

                // Store whether the template is valid or not
                isTemplate = typeof template === 'string' && rIdentifier.test(template);

            // Debugging only
            // console.log('jQuery-handlebars: Is a template? [%s, %s]', template, isTemplate);

            // These actions don't require any pre-processing
            if (typeof action === 'string') {

                // If a 'get' action is provided, then get the template(s)
                // The template string if not defined will return all template(s)
                if (/^FIND|GET$/i.test(action)) {

                    // The include parameter will be true, if the template is a string and valid anchor
                    return getTemplate($this, template, isTemplate);

                // If a 'compiled' action is provided, then return the compiled object literal
                } else if (/^COMPILED$/i.test(action)) {

                    return compiled;

                }

            }

            // Set our options from the defaults, overriding with the
            // parameter we pass into this function
            options = $.extend({}, $.fn.handlebars.options, options);

            // START: Sanitize the options

            // Check if the option type is a string and valid
            if (typeof options.type === 'string' && /^APPEND|COMPILED|RAW$/i.test(options.type)) {

                // Set to uppercase
                options.type = options.type.toUpperCase();

            } else {

                // Otherwise default to 'append' i.e. if null or simply invalid
                options.type = Type.APPEND;

            }

            // If the removal type is a string and valid, then set to uppercase
            if (typeof options.remove_type === 'string' && /^ALL|NONE|SAME$/i.test(options.remove_type)) {

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
                if (isTemplate && options.remove_type !== Remove.SAME) {

                    options.remove_type = Remove.SAME;

                } else {

                    // Otherwise use 'all'
                    options.remove_type = Remove.ALL;

                }

                // If the template is not defined, then set as null before removing
                if (!isTemplate) {

                    template = null;

                }

                return removeTemplate(this, $this, template, options);

            }

            // Assume it's an addition i.e. 'add'

            // The data object literal must contain data
            if (typeof options.validate === 'boolean' && options.validate && $.isEmptyObject(dataOrOptions)) {

                // console.log('jQuery-handlebars: Data was not passed to the plugin or is simply an empty plain object');
                return this;

            }

            // jQuery object reference
            var $selector = null;

            // If a valid string template is passed then check if it's compiled or get the jQuery object instead
            if (isTemplate) {

                // If compiled already then no need to re-compile
                if (typeof compiled[template] === 'function') {

                    // Debugging only
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
            } else if (template instanceof $ && typeof template.length === 'number' && template.length > 0) {

                // Get the first selection only
                $selector = template.first();

                // Get the selector name for using with the compiled object literal
                // If the selector property doesn't exist, then this will be set to null
                template = typeof $selector.selector !== 'undefined' ? $selector.selector : null;

                // If compiled already then no need to re-compile
                if (template !== null && typeof compiled[template] === 'function') {

                    // Debugging only
                    // console.log('jQuery-handlebars: %s has already been compiled', template);

                    // Return to continue chaining
                    return setTemplate(this, $this, template, dataOrOptions, options);

                }
            }

            // If an invalid selector, then return this to continue chaining
            if ($selector === null || template === null || $selector.length === 0) {

                // Debugging only
                // console.log('jQuery-handlebars: Template cannot be found');
                return this;

            }

            // Get the HTML of the template only
            var html = $selector.html();

            // Store the compiled template in the compiled store
            compiled[template] = Handlebars.compile(html);

            // Return to continue chaining
            return setTemplate(this, $this, template, dataOrOptions, options);
        }

    });

    // Fields (Private)

    // Store the compiled template(s) using the template string as the identifier i.e. key
    var compiled = {};

    // Methods (Private)

    // Note: Variable are called 'self' to avoid conflict with 'this'

    // Get the template in the content selector
    // include refers to whether to include the template in the selection
    var getTemplate = function ($self, template, include) {

            // Get the divs with the template data attribute and optional specified template string e.g. #some-template
            var templateLocate = (include && template ? '="' + template + '"' : '');
            return $self.find('div[' + DATA_ATTRIBUTE + templateLocate + ']');

        },

        // Remove the specified template from the content selector. If a template is not provided
        // then all template(s) that are contained within the content selector will be removed
        removeTemplate = function (self, $self, template, options) {

            // If the option has been passed to remove 'none', then respect this choice or if the template is null but the option is set to 'same'
            if (options.remove_type === Remove.NONE || (template === null && options.remove_type === Remove.SAME)) {

                // Debugging only
                // console.log('jQuery-handlebars: Template(s) were not removed [%s]', options.remove_type);

                // Return self to maintain chaining if there is nothing to remove
                return self;

            }

            // The include parameter will be set to true, when specifically looking for the provided template string
            var filtered = getTemplate($self, template, options.remove_type === Remove.SAME);
            if (filtered.length === 0) {

                // Debugging only
                // console.log('jQuery-handlebars: Unable to find any template(s) for removal [%s]', options.remove_type);

                // Return self to maintain chaining if there is nothing to remove
                return self;

            }

            // Remove from the DOM
            filtered.remove();

            // Debugging only
            // console.log('jQuery-handlebars: Removing template(s) [%s]', options.remove_type);

            // Remove the template from the compiled store, if the option is true
            if (typeof options.delete_compiled === 'boolean' && options.delete_compiled) {

                // Iterate through the filtered collection and remove from the template string from the compiled store
                $.each(filtered, function (index, element) {

                    // Get the data attribute for the template string if it's not null or has already been removed
                    var attribute = $(this).attr(DATA_ATTRIBUTE);
                    if (attribute === null || compiled[attribute] === undefined) {

                        return;

                    }

                    // Set to undefined to mimic deletion of the template
                    compiled[attribute] = undefined;

                    // Debugging only
                    // console.log('jQuery-handlebars: Removing compiled template [%s]', attribute);

                });

                if (template !== null) {

                    // Debugging only
                    // console.log('jQuery-handlebars: Removed the template from the compiled store [%s]', template);

                }

            }

        },

        // Set the specified template to the content selector
        setTemplate = function (self, $self, template, data, options) {

            // Previous implementations
            /*
                $self.children('*').not('script[type="text/x-handlebars-template"]').empty();
                $self.children('*:not(script[type="text/x-handlebars-template"])').empty();

                // Get all nodes apart from the Handlebarjs template script elements
                 var filtered = $self.contents().filter(function () {

                    return this.nodeType !== Node.COMMENT_NODE && // Not a comment
                        (this.nodeName !== 'SCRIPT' && this.type !== 'text/x-handlebars-template') // Not a handlebars template
                        ; // /[^\t\n\r ]/.test(this.textContent); // Not whitespace

                });
             */

            // The include parameter will be set to true, when specifically looking for the provided template string
            var filtered = getTemplate($self, template, options.remove_type === Remove.SAME);

            // Remove from the DOM if specified to do so
            if (options.remove_type !== Remove.NONE) {

                // Remove from the DOM
                filtered.remove();

                // Debugging only
                // console.log('jQuery-handlebars: Removed previous template(s) [%s]', options.remove_type);

            }

            // If set to not refill and template node(s) exist, then return this
            if (typeof options.refill === 'boolean' && !options.refill) {

                // Get the template(s) after potential removal. The parameter include has been set to true, as we are checking
                // if only the same template(s) exists (perhaps an option could/should be created)
                filtered = getTemplate($self, template, true);
                if (filtered.length > 0) {

                    // Debugging only
                    // console.log('jQuery-handlebars: Refill has been set to false and the content element contains template(s) [%s]', options.remove_type);

                    return self;

                }

            }

            // Append to the content element by checking the type. Default is 'append'
            switch (options.type) {
                case Type.COMPILED:
                case Type.RAW:

                    // Debugging only
                    // console.log('jQuery-handlebars: Returning raw HTML', template);

                    // Return the compiled HTML
                    return compiled[template](data);

                default:

                    // Create a div element with the template appended to it
                    // This contains a data-* attribute called data-jquery-handlebars for easy association
                    // that it's a Handlebarjs template
                    var $div = $('<div/>')
                        .attr(DATA_ATTRIBUTE, template)
                        .append(compiled[template](data));

                    // Append the div to content element
                    $self.append($div);

                    // Debugging only
                    // console.log('jQuery-handlebars: Appending template to the content element [%s]', template);
                    break;

            }

            return self;
        };

    // Constants

    // The data-* attribute name
    var DATA_ATTRIBUTE = 'data-jquery-handlebars',

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
            RAW: 'RAW'
        };

    // Defaults

    $.fn.handlebars.options = {
        // Delete the template from the compiled store on removal
        delete_compiled: true,

        // Allow the option of adding multiple template(s) inside an element
        refill: true,

        // Remove pre-existing compiled templates from the content element
        //
        // The following options are:
        //      'all': Remove all valid template(s) from the content element
        //      'none' (default): Don't remove any template(s)
        //      'same': Remove only those template(s) that match the provided template string
        remove_type: Remove.NONE,

        // How to output the compiled template to the content element
        //
        // The following options are:
        //      'append' (default): Append to the content element
        //      'compiled': Return a compiled template as HTML
        //      'raw': Return a compiled template as HTML
        type: Type.APPEND,

        // Check whether the data passed to the plugin is empty
        validate: true
    };

})(jQuery);
