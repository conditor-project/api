RED=\033[0;31m
NC=\033[0m

.PHONY: help
.DEFAULT_GOAL := help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## build localy docker image of API
	docker-compose -f ./docker-compose.yml build

run-prod: ## run conditor-api with prod parameters
	NODE_ENV=production docker-compose up -d

run-debug: ## run conditor-api with debug parameters
	NODE_ENV=development DEBUG=* docker-compose -f ./docker-compose.yml up

kill: ## stop running containers (the hard way)
	docker-compose -f ./docker-compose.yml kill
stop: ## stop running containers
	docker-compose -f ./docker-compose.yml stop

ps: ## show current container status
	docker-compose -f ./docker-compose.yml ps

