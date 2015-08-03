; (function($, undefined) {

    // Initial idea: http://blog.teamtreehouse.com/handlebars-js-part-3-tips-and-tricks

    // Plugin Logic
    $.fn.extend({

        handlebars: function(template, data, options) {

            // The data object literal must contain data
            if ($.isEmptyObject(data)) {

                console.log('Data was not passed or is an empty plain object');
                return this;

            }

            // Set our options from the defaults, overriding with the
            // parameter we pass into this function
            options = $.extend({}, $.fn.handlebars.options, options);

            // jQuery object reference
            var $selector = null,

                // jQuery object reference for this. Only select the first selector of the collection
                $this = $(this).first();

            // If a string is passed then check if it's compiled or get the jQuery object
            if (typeof template === 'string') {

                // If compiled already
                if (typeof compiled[template] === 'function') {

                    // Debugging only
                    console.log(template + ' already exists');

                    // Return to continue chaining
                    return setElement(this, $this, options, compiled[template](data));

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
                    console.log(template + ' already exists');

                    // Return to continue chaining
                    return setElement(this, $this, options, compiled[template](data));

                }
            }

            // If an invalid selector, then return this to continue chaining
            if ($selector === null || template === null || $selector.length === 0) {

                // Debugging only
                console.log('Template cannot be found');
                return this;

            }

            // Get the HTML of the template only
            var html = $selector.html();

            // Store the compiled template in the compiled store
            compiled[template] = Handlebars.compile(html);

            // Return to continue chaining
            return setElement(this, $this, options, compiled[template](data));
        }

    });

    // Fields (Private)

    // Store the compiled templates, using the selector string as the identifier i.e. key
    var compiled = {};

    // Methods (Private)

    // Helper function for setting an element with a template
    // Variables are called self instead of this, to avoid conflict
    var setElement = function(self, $self, options, compiled) {
        // Empty the previous contents of this, excluding all Handlebarjs template script elements
        //
        // Previous implementations
        // $self.children('*').not('script[type="text/x-handlebars-template"]').empty();
        // $self.children('*:not(script[type="text/x-handlebars-template"])').empty();

        // Get all nodes apart from the Handlebarjs template script elements
        var filtered = $self.contents().filter(function() {
            // Only filter those which don't have the handlebarsjs type and SCRIPT node name and not whitespace
            return this.nodeName !== 'SCRIPT' && this.type !== 'text/x-handlebars-template' && /[^\t\n\r ]/.test(this.textContent);
        });

        // If set to not overwrite nodes exist, then return this
        if (!options.overwrite && filtered.length > 0) {

            // Debugging only
            console.log('Overwrite has been set to false and the content element is not empty');
            return self;

        }

        // Remove from the DOM
        filtered.remove();

        // Append to this
        $self.append(compiled);

        return self;
    };

    // Defaults
    $.fn.handlebars.options = {
        overwrite: true
    };

})(jQuery);
