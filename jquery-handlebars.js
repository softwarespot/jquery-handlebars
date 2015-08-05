; (function($, undefined) {

    // Initial idea: http://blog.teamtreehouse.com/handlebars-js-part-3-tips-and-tricks

    // Plugin Logic
    $.fn.extend({

        // date doubles up as options when the action is 'clear' or 'remove'
        handlebars: function(action, template, data_or_options, options) {

            // jQuery object reference for this. Only select the first selector of the collection
            var $this = $(this).first();

            // Set our options from the defaults, overriding with the
            // parameter we pass into this function
            options = $.extend({}, $.fn.handlebars.options, options);

            // START: Sanitize the options

            // Check if the option type is a string
            if (typeof options.type === 'string') {

                // Set to uppercase
                options.type = options.type.toUpperCase();

            }

            // If the removal type is a string and valid, then set to uppercase
            if (typeof options.remove_type === 'string' && /^ALL|NONE|SAME$/i.test(options.remove_type)) {

                options.remove_type = options.remove_type.toUpperCase();

            } else {

                // Otherwise default to 'none' i.e. if null or is simply invalid
                options.remove_type = Remove.NONE;

            }

            // END: Sanitize the options

            // If a clear action is provided then remove the template
            if (/^CLEAR|REMOVE$/i.test(action)) {

                // Extend the options again, as the data_or_options acts as an alias for options when removal is used
                options = $.extend(options, data_or_options);

                // If the options parameter was undefined and the default is 'none', then temporarily
                // overwrite as 'all'; otherwise the user knows what they'e doing (I hope)
                if ((typeof data_or_options === 'undefined' || typeof data_or_options.remove_type === 'undefined') && options.remove_type === Remove.NONE) {

                    options.remove_type = Remove.ALL;

                    // Debugging only
                    console.log('jquery-handlebars: Overriding default removal type from "none" to "all" since the remove action was passed to the plugin');
                }

                if (typeof template === 'undefined') {
                    template = null;
                }

                return removeTemplate(this, $this, template, options); // data is basically options in this instance

            }

            // Assume it's an addition i.e. 'add'

            // The data object literal must contain data
            if (options.validate && $.isEmptyObject(data_or_options)) {

                console.log('jquery-handlebars: Data was not passed or is simpley an empty plain object');
                return this;

            }

            // jQuery object reference
            var $selector = null;

            // If a string is passed then check if it's compiled or get the jQuery object
            if (typeof template === 'string') {

                // If compiled already
                if (typeof compiled[template] === 'function') {

                    // Debugging only
                    console.log('jquery-handlebars: ' + template + ' already exists');

                    // Return to continue chaining
                    return setTemplate(this, $this, template, data_or_options, options);

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

                // If compiled already
                if (template !== null && typeof compiled[template] === 'function') {

                    // Debugging only
                    console.log('jquery-handlebars: ' + template + ' already exists');

                    // Return to continue chaining
                    return setTemplate(this, $this, template, data_or_options, options);

                }
            }

            // If an invalid selector, then return this to continue chaining
            if ($selector === null || template === null || $selector.length === 0) {

                // Debugging only
                console.log('jquery-handlebars: Template cannot be found');
                return this;

            }

            // Get the HTML of the template only
            var html = $selector.html();

            // Store the compiled template in the compiled store
            compiled[template] = Handlebars.compile(html);

            // Return to continue chaining
            return setTemplate(this, $this, template, data_or_options, options);
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

            // Get the divs with the template data attribute and optional specified template e.g. #some-template
            var templateLocate = (include && template ? '="' + template + '"' : '');
            return $self.find('div[' + DATA_ATTRIBUTE + templateLocate + ']');

        },

        // Remove the specified template from the content selector. If a template is not provided
        // then all template(s) that are contained within the content selector will be removed
        removeTemplate = function (self, $self, template, options) {

            // If the option has been passed to remove 'none', then respect this choice
            if (options.remove_type === Remove.NONE) {

                // Debugging only
                console.log('jquery-handlebars: Template(s) were not removed [' + options.remove_type + ']');

                // Return self to maintain chaining if there is nothing to remove
                return self;

            }

            var filtered = getTemplate($self, template, options.remove_type === Remove.SAME);
            if (filtered.length === 0) {

                // Debugging only
                console.log('jquery-handlebars: Unable to find any template(s) for removal [' + options.remove_type + ']');

                // Return self to maintain chaining if there is nothing to remove
                return self;

            }

            // Remove from the DOM
            filtered.remove();

            // Debugging only
            console.log('jquery-handlebars: Removing template(s) [' + options.remove_type + ']');

            // Remove the template from the compiled store, if a template is provided and the option of remove 'same'
            if (options.remove_type === Remove.SAME && template) {

                // Set to undefined to mimic deletion of the template
                compiled[template] = undefined;

                // Debugging only
                console.log('jquery-handlebars: Removed the template from the compiled store [' + template + ']');

            }

        },

        // Set the specified template to the content selector
        setTemplate = function (self, $self, template, data, options) {

            // Previous implementations
            /*
                $self.children('*').not('script[type="text/x-handlebars-template"]').empty();
                $self.children('*:not(script[type="text/x-handlebars-template"])').empty();

                // Get all nodes apart from the Handlebarjs template script elements
                 var filtered = $self.contents().filter(function() {

                    return this.nodeType !== Node.COMMENT_NODE && // Not a comment
                        (this.nodeName !== 'SCRIPT' && this.type !== 'text/x-handlebars-template') // Not a handlebars template
                        ; // /[^\t\n\r ]/.test(this.textContent); // Not whitespace

                });
             */

            var filtered = getTemplate($self, template, options.remove_type === Remove.SAME);

            // Remove from the DOM if specified
            if (options.remove_type !== Remove.NONE) {

                // Remove from the DOM
                filtered.remove();

                // Debugging only
                console.log('jquery-handlebars: Removed previous template(s) [' + options.remove_type + ']');

            }

            // If set to not refill and template node(s) exist, then return this
            if (!options.refill) {

                // Get the template(s) after possible removal. include has been set to true, as we are checking if only
                // the same template(s) exist
                filtered = getTemplate($self, template, true);
                if (filtered.length > 0) {

                    // Debugging only
                    console.log('jquery-handlebars: Refill has been set to false and the content element contains template(s) [' + options.remove_type + ']');

                    return self;

                }

            }

            // Append to this by checking the type. Default is append
            switch (options.type) {
                case 'FILL':
                case 'REFILL':
                    // $self.html(compiled[template](data)); // Dangerous to do if handlebarsjs template(s) are embedded inside the element
                    // Debugging only
                    console.log('jquery-handlebars: fill/refill is NOT IMPLEMENTED [' + template + ']');
                    break;

                default:
                    // Create a div element with the template appended
                    // This contains a data-* attribute called data-jquery-handlebars for easy association
                    // that it's a template
                    var $div = $('<div/>')
                        .attr(DATA_ATTRIBUTE, template)
                        .append(compiled[template](data));

                    // Append the div to self i.e. the content block
                    $self.append($div);

                    // Debugging only
                    console.log('jquery-handlebars: Appending template to the content element [' + template + ']');
                    break;
            }

            return self;
        };

    // Constants

    // The data-* attribute name
    var DATA_ATTRIBUTE = 'data-jquery-handlebars',

        // Removal constants. As who enjoys magic values?
        Remove = {
            ALL: 'ALL',
            NONE: 'NONE',
            SAME: 'SAME'
        };

    // Defaults

    $.fn.handlebars.options = {
        // Allow the option of adding multiple template(s) inside an element
        refill: true,

        // Removal options
        // 'all': Remove all valid template(s)
        // 'same': Remove only those template(s) that match the provided template
        // 'none' (default): Don't remove any template(s)
        remove_type: 'none',

        // Type of writing: fill, refill, append (default)
        type: 'append',

        // Check whether the data passed is empty
        validate: true
    };

})(jQuery);