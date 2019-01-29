# Agrégations

Des données d'agrégations peuvent êtres obtenues sur certaines routes de l'API Conditor via le paramètre d'url `aggs`.

Le fonctionnement de ces agrégations se base entiérement sur celui d'[Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html), hormis en ce qui concerne la syntaxe qui elle a été adaptée pour les besoins de l'API.

## Liste des routes supportant les agrégations

- `/records`
- `/records/_filter/[<source>]/[<year>]/[<duplicate>]/[<nearDuplicate>]`
- `/records/<idConditor>`

## Syntaxe

Nom du paramètre d'URL : `aggs` (string)

La syntaxe à utiliser dépend du type du champ à agréger.

* Pour les agrégations de type `terms` :

        aggregationType : field : {options}?

* Pour les agrégations de type `date_range` :

        aggregationType : field : [ranges]+ : {options}?


## Limitation

Les limitations sont les même que pour Elasticsearch.
En particulier, les agrégations sont interdites sur certains types de champs, notamment ceux de type "`text`".
Il est donc parfois nécessaire d'utiliser une version "normalisée" des champs textuels (Ex : `title.default.normalized`) pour faire l'agrégation correspondante.

## Exemples

Ex. de syntaxe d'agrégation de type`terms`:

aggs=terms:source:{size:20, order:{_count:desc}}

------

Ex. de syntaxe d'agrégation de type `date_range`:

aggs=date_range:publicationDate.date:[2008 TO now]
