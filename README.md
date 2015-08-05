# jQuery-handlebars - v0.1.0-beta
A jQuery plugin for taking the strain out of using the wonderful Handlebarsjs template framework

## Warning
Documentation is to be finalised on 2015/08/06. Please refrain from using until the API has finally been stabilised. Thank you.

## What is jQuery-handlebars?

How many times have you found yourself writing the following over and over again in your project? Quite laborious isn't it?
Isn't using a template framework meant to make our developing lives a little easier? Instead of repeating the same things over and over again.
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
```

The plugin will basically take care of compiling the template (if it hasn't been done already), mark in the DOM that it's a template by wrapping in a div with a data-* attribute and append to the content element.
How easier could it be?

## Options
Coming soon
