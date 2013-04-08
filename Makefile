test:
	@./node_modules/.bin/mocha \
		--growl \
		--require spec/common.js \
		--reporter spec \
		spec/*.spec.js

min:
	@./node_modules/.bin/uglifyjs lib/obs.js > lib/obs.min.js

clean:
	@rm -rf dist

dist/vendor: clean
	@mkdir -p dist/vendor

dist/vendor/aug.js: dist/vendor
	@wget -P dist/vendor/ https://raw.github.com/jgallen23/aug/0.0.5/dist/aug.js

dist/vendor/sublish.js: dist/vendor
	@wget -P dist/vendor/ https://raw.github.com/pluma/sublish/0.2.0/lib/sublish.js

dist: dist/vendor/aug.js dist/vendor/sublish.js
	@cp lib/obs.js dist/vendor/
	@cat dist/vendor/*.js | ./node_modules/.bin/uglifyjs > dist/obs.all.min.js
	@rm -r dist/vendor

lint:
	@./node_modules/.bin/jshint lib/obs.js spec

.PHONY: lint test clean
