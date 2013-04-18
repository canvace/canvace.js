canvace.js
==========

This repository holds the JavaScript game engine of the Canvace Platform.

## Prerequisites for the build

You'll need [Grunt 0.4.x](http://gruntjs.com/).

Once you've made sure you have Grunt installed, you can install all the
required gruntplugins and related Node.js modules by moving to the root
of the repository within the command shell and entering the following
command:

```shell
npm install
```

## Building the library

You can easily build the library by launching the default Grunt task:

```shell
grunt
```

The build process will output two files: `bin/canvace.js` and its minified
counterpart, `bin/canvace.min.js`.

## Building the documentation

The documentation uses [YUIDoc](http://yui.github.io/yuidoc/) and is built
by a separate Grunt task:

```shell
grunt yuidoc
```

After the build, you'll find the documentation in the `doc` directory.
