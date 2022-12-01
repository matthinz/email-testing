.PHONY: build watch

build: dist/email.html

node_modules: package.json yarn.lock
	yarn && touch $@

watch: node_modules
	yarn chokidar "emails/**/*" "images/**/*" "styles/**/*" -c make

dist/email.html: emails/email.html styles/style.css node_modules
	- mkdir -p $(shell dirname $@)
	yarn juice \
		--web-resources-images 0 \
		$< $@