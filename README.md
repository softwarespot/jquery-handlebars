# jQuery-handlebars - v0.1.0-beta
A jQuery plugin for alleviating the strain out of using the wonderful [Handlebars](http://handlebarsjs.com/) template framework.

## Warning
Documentation is to be finalised (hopefully) by the 2015/08/15, though honestly the plugin is fully stable to start using in production environments.
**NOTE:** The code is heavily documented, therefore if you feel this README is lacking content then please refer to that.

## What exactly is jQuery-handlebars?

How many times have you found yourself writing the following code over and over again? Quite laborious isn't it?
Surely using a template framework is meant to make our "developing" lives a little easier?
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
As you can see, if you do this multiple times over the course of your project it can become bloated and quite repetitive ( seems I repeated myself there =) ). Then there is the issue of injecting a template into an element with the ability to remove or replace at some point. Then you're talking about a lot more boilerplate code and for what? Wouldn't it be great if there was a jQuery plugin (there is) that allowed me to specify a template, append to the content element and keep record of those that have been compiled before? With the additional bonus of being able to remove a single template or all templates from the content element. Well you're in luck...

## jQuery-handlebars is as simple as 1-2-3, no really, it's that simple.

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
The plugin will basically take care of compiling the template (if it hasn't been done already), mark in the DOM that it's a template by wrapping in a div with a data-* attribute (`data-jquery-handlebars`) and append to the content element.
How easier could it be? It could probably even make you a sandwich if it wanted to =)

##Documentation

The following outlines in detail how to use following plugin, with the addition of thoroughly commented examples.

### Actions

The plugin has 4 actions that are passed as the first parameter. For simplicity and semantics, the actions
have multiple aliases.

By default the plugin has 4 parameters, though these parameters have different roles depending on the action passed to the plugin. Please refer to the examples below as to what each parameter represents depending on the action. This is similar to jQuery in which functions appeared to be overloaded.

#### `add`

Add a template to the specified content element using the template string parameter.

#### `clear/empty/remove`

Remove a specified template or all template(s) from the content element.

#### `find/get`

Retrieve the HTML for a particular template in the content element. If no template is provided, then all templates will be found.

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

The following options below can either be passed via the `options` parameter or by overriding the defaults using `$.fn.handlebars.options.[PROPERTY]`, in which the property is substituted for a particular option.

#### Example

An example of overwriting the default options of the plugin.

```javascript
    $.fn.handlebars.delete_compiled = false;
```

#### `delete_compiled`

Delete the template(s) from the compiled store when a `clear` action is specified. Accepts true (default) or false.

#### `refill`

Allow the addition of multiple template(s) inside a content element. Accepts true (default) or false.

#### `remove_type`

Remove pre-existing (compiled) templates from the specified content element when adding/appending a template.

The following options are:
- 'none' (default): Don't remove any template(s) from the content element
- 'all': Remove all valid template(s) from the content element
- 'same': Remove only those template(s) that match the provided template string from the content element

#### `type`

How to output the compiled template to the specified content element?

The following options are:

- 'append' (default): Append to the specified content element
- 'html': Return a compiled template as HTML
- 'compiled'/'raw': Return a compiled template as HTML

#### `validate`

Check whether the data passed to the plugin is empty. Accepts true (default) or false.

## Contribution

To contribute to the project, you will first need to install [grunt](gruntjs.com) globally on your system and then run the following command in jQuery-handlebars directory. This installs all the relevant modules related to hinting and uglification.

```bash
cd jquery-handlebars
npm install
```

Call the following command to start 'watching' for any changes to the main JS file i.e. jquery-handlebars.js.
```bash
grunt
```

Call the following command to invoke JSHint and check that your changes meet good quality standards for JavaScript.
```bash
grunt jshint
```

Call the following command to invoke Uglify, which will uglify aka minify the main JS file i.e. jquery-handlbars.js.
```bash
grunt uglify
```
