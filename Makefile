.PHONY: test benchmark lint clean install publish

test:
	npm test

test-coverage:
	npm run test:coverage

benchmark:
	npm run benchmark

lint:
	@echo "No linter configured yet"

clean:
	rm -rf node_modules
	rm -f skill-catalog.json

install:
	npm install

publish:
	npm publish

version:
	@node bin/omg-ai.js version

doctor:
	@node bin/omg-ai.js doctor

status:
	@node bin/omg-ai.js status

setup:
	@node bin/omg-ai.js setup

list-installable:
	@node bin/omg-ai.js list-installable