LICENSE_COMMENT="/*! obs 0.9.0 Copyright (c) 2013 Alan Plum. MIT licensed. */"

test:
	@./node_modules/.bin/mocha \
		--growl \
		--reporter spec \
		spec/*.spec.js

clean:
	@rm -rf dist

dist/vendor: clean
	@mkdir -p dist/vendor

dist/obs.js: dist/vendor
	@echo $(LICENSE_COMMENT) > dist/obs.js
	@cat src/obs.js >> dist/obs.js

dist/obs.globals.js: dist/vendor
	@echo $(LICENSE_COMMENT) > dist/obs.globals.js
	@echo "(function(root){\
	var require=function(key){return root[key];},\
	module={};" >> dist/obs.globals.js
	@cat src/obs.js >> dist/obs.globals.js
	@echo "root.obs = module.exports;\
	}(this));" >> dist/obs.globals.js

dist/obs.amd.js: dist/vendor
	@echo $(LICENSE_COMMENT) > dist/obs.amd.js
	@echo "define(function(require) {\
	var module = {};" >> dist/obs.amd.js
	@cat src/obs.js >> dist/obs.amd.js
	@echo "return module.exports;\
	});" >> dist/obs.amd.js

dist/vendor/aug.js: dist/vendor
	@wget --no-check-certificate -P dist/vendor/ https://raw.github.com/jgallen23/aug/0.1.0/dist/aug.js

dist/vendor/sublish.globals.js: dist/vendor
	@wget --no-check-certificate -P dist/vendor/ https://raw.github.com/pluma/sublish/0.4.2/dist/sublish.globals.js

dist/obs.all.min.js: dist/vendor/aug.js dist/vendor/sublish.globals.js dist/obs.globals.js
	@cat dist/vendor/aug.js \
	dist/vendor/sublish.globals.js \
	dist/obs.globals.js | ./node_modules/.bin/uglifyjs > dist/obs.all.min.js

dist/obs.min.js: dist/obs.js
	@./node_modules/.bin/uglifyjs dist/obs.js > dist/obs.min.js

dist/obs.globals.min.js: dist/obs.globals.js
	@./node_modules/.bin/uglifyjs dist/obs.globals.js > dist/obs.globals.min.js

dist/obs.amd.min.js: dist/obs.amd.js
	@./node_modules/.bin/uglifyjs dist/obs.amd.js > dist/obs.amd.min.js

dist: dist/obs.min.js dist/obs.globals.min.js dist/obs.all.min.js dist/obs.amd.min.js

lint:
	@./node_modules/.bin/jshint src/obs.js spec

.PHONY: lint test clean
