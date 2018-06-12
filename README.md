[![Build Status](https://travis-ci.org/conditor-project/api.svg?branch=master)](https://travis-ci.org/conditor-project/api)

# Conditor api
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

## Running the API

Before launchig the following commands, you must set `LOG_PATH` and `CONDITOR_ES_HOSTS` environments variables. For example :

```bash
export LOG_PATH="$HOME/var/log"
export CONDITOR_ES_HOSTS="localhost:9200"
```

You can also set other optional environment variables :

```bash
export CONDITOR_API_HOST="0.0.0.0"
export CONDITOR_API_PORT="63332"
export REVERSE_PROXY="~"
export JWT_KEY="Secret phrase for generating tokens"
export NODE_ENV="development|production"
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

## Querying the API

The official, production version, of the Conditor API, is (or will be soon) available at https://api.conditor.fr

All available URLs are listed and descripted on [this page](./doc/Records.md).

## Access rights

Access is restricted to authenticated and authorized users. Authentication is provided via a [JWT token](https://jwt.io/).

There are 2 ways to use your JWT token :

- Directly in your URL, via the `access_token` parameter (not very convenient)
- In the header of your HTTP request: `Authorization: Bearer <token>`

To obtain a token, contact the Conditor team, they will give you a 31 days valid one

## Token Management

Currently, 3 commands can help you for managing tokens :

### cleanup token registry

`npm run cleanup-registry`

Script available at [./bin/cleanup-registry.js](./bin/cleanup-registry.js)

### generate a new token

`npm run generate-token`

Generate a new JWT token, valid during 31 days

Script available at [./bin/generate-token.js](./bin/generate-token.js)

### list-registry

`npm run list-registry`

List all avalaible JWT tokens, with validity ranges.

Script available at [./bin/list-registry.js](./bin/list-registry.js)



