.PHONY: build deploy watch

build: dist/email.html

node_modules: package.json yarn.lock
	yarn && touch $@

deploy: build scripts/deploy.ts
	yarn ts-node scripts/deploy.ts dist/email.html
	yarn ts-node scripts/deploy.ts dist/email-inlined.html

watch: node_modules
	yarn chokidar "emails/**/*" "images/**/*" "styles/**/*" -c make

dist/email.html: emails/email.html styles/style.css scripts/build.ts node_modules
	- mkdir -p $(shell dirname $@)
	yarn ts-node scripts/build.ts $< $(shell dirname $@)
