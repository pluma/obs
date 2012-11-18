test:
	@./node_modules/.bin/mocha \
		--growl \
		--require spec/common.js \
		--reporter spec \
		spec/*.spec.js

.PHONY: test
