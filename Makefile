.PHONY: build deploy watch

build: dist/email.html

node_modules: package.json yarn.lock
	yarn && touch $@

deploy: build
	yarn ts-node scripts/deploy.ts dist/email.html

watch: node_modules
	yarn chokidar "emails/**/*" "images/**/*" "styles/**/*" -c make

dist/email.html: emails/email.html styles/style.css node_modules
	- mkdir -p $(shell dirname $@)
	yarn juice \
		--web-resources-images 0 \
		$< $@
