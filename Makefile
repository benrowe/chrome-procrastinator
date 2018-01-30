.DEFAULT_GOAL := build


# build everything into the dist
build: init 
	@yarn build

deploy: init
	@yarn run deploy

init:
	# ensure node/npm/yarn is installed
	@echo "detecting presence of npm/yarn"

.PHONY: build deploy init
