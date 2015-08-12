# jQuery-handlebars - v0.1.0-beta
A jQuery plugin for taking the strain out of using the wonderful [Handlebars](http://handlebarsjs.com/) template framework

## Warning
Documentation is to be finalised by 2015/08/15, though the plugin is fully stable to start using in production environments. The code is also heavily documented, if you feel this README is lacking somewhat.

## What is jQuery-handlebars?

How many times have you found yourself writing the following over and over again in your project? Quite laborious isn't it?
Surely using a template framework is meant to make our "developing" lives a little easier? Instead of repeating the same things over and over again.
```javascript

    // Cache the jQuery object of where to append the template
    var $content = $('#content');

    // Get the HTML of the template only
    var html = $('#my-template').html();

    // Compile the template
    var template = Handlebars.compile(html);

    // Data to pass to the template
    var context = {demo: 'This is a simple demo'};

    // Append the template to the content element
    $content.append(template(context));

```
As you can see, if you do this multiple times over the course of your project it can become bloated and repetitive. Then there is the problem of injecting a template into an element but then having the ability to remove or replace it at some point. Then you're talking about a lot more boilerplate code and for what? Wouldn't it be great if I could have a jQuery plugin that allowed me to specify a template, where to append and keep record of those that have been compiled and separate them from the other content. Well you're in luck...

## jQuery-handlebars is as simple as 1-2-3, no, really it is.

```javascript
    // Cache the jQuery object of where to append the template
    var $content = $('#content');

    // Data to pass to the template
    var context = {demo: 'This is a simple demo'};

    // Append the template to the content element
    //  'add': action
    //  '#my-template': template id string or jQuery selector object
    //  context: context data to pass to the template
    $content.handlebars('add', '#my-template', context);

    // It's that easy!
```

The plugin will basically take care of compiling the template (if it hasn't been done already), mark in the DOM that it's a template by wrapping in a div with a data-* attribute and append to the content element.
How easier could it be? It could probably even make you a sandwich if it wanted to =)

## Actions

The plugin has 4 actions that are passed as the first parameter. For simplicity and semantics, the actions
have multiple aliases.

By default the plugin has 4 parameters, though these parameters have different roles depending on the action passed to the plugin. Please refer to the examples below as to what each parameter represents depending on the action. This is similar to jQuery in which functions appeared to be overloaded.

#### `add`

Add a template to the specified content element using the template string parameter.

#### `clear/empty/remove`

Remove a specified template or all template(s) from the content element.

#### `find/get`

Retrieve the HTML for a particular template.

#### `compiled/store`

Get all the compiled templates stored by the plugin.

## Demo of actions

- add (default): Add a template to a content element, by either passing a template string id or a jQuery selector
```javascript
    $content.handlebars('add',
        '#template-string' | $jQuerySelector,
        context,
        override_default_options [optional]);
```
- clear/remove: Clear either a specified template or all templates for a content element
```javascript
    $content.handlebars('clear',
        '#template-string' | $jQuerySelector [optional],
        override_default_options [optional]);
```
- get/find: Get either a collection of compiled templates from the DOM by template string or all compiled templates from the DOM
```javascript
    $content.handlebars('get',
        '#template-string' | $jQuerySelector [optional],
        override_default_options [optional]);
```
- compiled: Get all compiled templates stored by the plugin
```javascript
    $content.handlebars('compiled');
```

### Options

The following options can either be passed via the options parameter or by overriding the defaults using `$.fn.handlebars.options.[PROPERTY]`, in which the property is substituted for a particular option.

#### `delete_compiled`

Delete the template from the compiled store when a removal action is specified. Accepts true (default) or false

#### `refill`

Allow the addition of multiple template(s) inside a content element. Accepts true (default) or false.

#### `remove_type`

Remove pre-existing compiled templates from the specified content element when adding/appending a template.

The following options are:
- 'none' (default): Don't remove any template(s)
- 'all': Remove all valid template(s) from the content element
- 'same': Remove only those template(s) that match the provided template string

#### `type`

How to output the compiled template to the specified content element.

The following options are:

- 'append' (default): Append to the specified content element
- 'html': Return a compiled template as HTML
- 'compiled'/'raw': Return a compiled template as HTML

#### `validate`

Check whether the data passed to the plugin is empty. Accepts true (default) or false.
