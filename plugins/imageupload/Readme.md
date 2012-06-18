#Bobamo ImageUpload
Provides ImageUpload upload and display using blueimp.  Including drag and drop from to your browser.s

##Usage
Install

    *brew install ImageMagick
    *add 'imageupload' to your app config
```javascript
 app.use('/bobamo', bobamo.express({plugin:['session','imageupload'] ...
```
    *import and ImageInfo into your model

```javascript
    var ImageInfo = require('../plugins/imageupload/ImageInfo')
```
    *Use it somewhere
    var UserSchema = new Schema({
        images:[ImageInfo]
    });

##Bugs
* Does not support ref's yet.  This should be supported shortly.

