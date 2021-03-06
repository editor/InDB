# dash [![Build Status](https://travis-ci.org/buley/dash.png?branch=master)](https://travis-ci.org/buley/dash.svg) [![Coverage Status](https://coveralls.io/repos/buley/dash/badge.png?branch=master)](https://coveralls.io/r/buley/dash?branch=master)

A cookie-sized JavaSript library wrapping the IndexedDB "HTML5" database API.

#### Key Features
* Simplified callbacks through promises
* Transaction and optionally version-free 
* Declarative databases, object stores and indexes
* 5KB gzipped (18KB uncompressed)
* Tests passing Chrome 61.0.3163

#### Installation Options

* Download [dash.js](https://raw.github.com/buley/dash/master/dist/dash.js)
* Install via [bower](https://github.com/bower/bower): `bower install dash`

#### Up And Running

	/* There's no setup required to get started using IndexedDB with dash. */
	/* Just start adding entries and any declared databases, object stores and 
	 * indexes will be provided */
	dash.add.entry({
	    database: 'foo',
	    store: 'bar',
	    data: { baz: new Date().getTime() }
	})((add) => {
	    dash.get.entry(add)((get) => {
	      console.log('Data', get.entry)
	    });
	});

### Developer Features

* Free (MIT Licensed)
* [Task-based](http://gruntjs.com/) Development Workflow
* [Automated](https://github.com/karma-runner/karma) [Jasmine](http://pivotal.github.io/jasmine/) [Testing](https://github.com/karma-runner/karma-jasmine) 
* [Coverage](https://github.com/gotwarlost/istanbul) [Testing](https://github.com/karma-runner/karma-coverage)
* Continuous [Integration](http://travis-ci.org/buley/dash) and [Coverage](https://github.com/cainus/node-coveralls) Reporting


#### To Test

    npm install
    grunt

Building requires `grunt-cli`
