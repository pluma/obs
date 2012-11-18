test:
	@./node_modules/.bin/mocha \
		--growl \
		--require spec/common.js \
		--reporter spec \
		spec/*.spec.js

min:
	@./node_modules/.bin/uglifyjs lib/obs.js > lib/obs.min.js

lint:
	@./node_modules/.bin/jshint lib spec

.PHONY: lint test
