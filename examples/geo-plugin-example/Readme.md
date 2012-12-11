#Plugin Example Geo

##Description:
This plugin is an example to show how you can extend Bobamo using a plugin.  In addition it shows how to use
and customize finders.  Really should look at the code, for better explanations.

##Installation
```npm install```


##Writing the Geo Plugin
The Geo plugin is a relatively trivial plugin that adds a few things to bobamo.  It adds a custom
schema type to mongoose, and a couple of custom editors.

##Writing Editors
Basically you need to write a backbone form Editor by extending Backbone.Form.editors.<something> and
put it in the Form.editors namespace.        This file should be in public/js/libs/editors/<your editor>


For configuration, you can define backbone schema for per field configuration.

##Writing finders.
Bobamo tries to make finders relatively simple.  You can define a finder in the traditional mongoose
way, but in addition you can extend finders using the backbone-forms schema.

