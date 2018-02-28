# api
Main api of the conditor-project

## Description

The API's goal is to expose deduplicated bibliographical records of "conditor platform".

In order to be fully-functionnal, the API must be able to connect a Conditor Elasticsearch cluster.

## Under the hood

This API is coded in NodeJS with [ExpressJS](http://expressjs.com/) framework.

It can be run by different ways :

* Basically, with the `node` CLI
* Using [forever](https://github.com/foreverjs/forever), via the `npm start` command
* With docker, via the `make run-prod` command

Logs are managed with morgan, and written in the `$LOG_PATH/conditor-api.log` file

## Prerequisites

* Node v8+ / NPM5+ (tested with node 8.9.4)
* docker & docker-compose for Docker deployment

## Installation

```bash
git clone https://github.com/conditor-project/api.git
cd api
```

For native node start or forever start :

```bash
npm install
```

For docker usage

```bash
make build
```

## Usage

Before launchig the following commands, you must set `LOG_PATH` and `CONDITOR_ES_HOSTS` environments variables. For example :

```bash
export LOG_PATH="$HOME/var/log"
export CONDITOR_ES_HOSTS="localhost:9200"
```

For native node start or forever start :

```bash
npm start
```

For development purpose

```bash
npm run dev
```

For docker deployment in production environment

```bash
make run-prod
```

For docker deployment in development/debugging environment

```bash
make run-debug
```

You can of course simultaneously set environment variables and start the API :

```bash
LOG_PATH="$HOME/var/log" \
CONDITOR_ES_HOSTS="localhost:9200" \
make run-prod
```

