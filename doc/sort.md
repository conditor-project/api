# Tri des résultats

Sur les requêtes renvoyant une liste de résultats, il est possible d'ordonnancer ceux-ci selon une liste de critères via le paramètre d'URL `sort`. 

Ce mécanisme de tri est une transposition du mécanisme interne du moteur de recherche Elasticsearch, [documenté ici](https://www.elastic.co/guide/en/elasticsearch/reference/6.x/search-request-sort.html). Par conséquent, le nommage des paramètres et des options de l'API Conditor est identique, et les valeurs par défaut sont les mêmes.

## Liste des routes supportant le paramètre sort

- `/records`
- `/records/_filter/[<source>]/[<year>]/[<duplicate>]/[<nearDuplicate>]`
- `/records/_filter/[<source>]/[<year>]/[<duplicate>]/[<nearDuplicate>]/zip`
- `/records/<idConditor>/duplicates/[and_self]`
- `/records/<idConditor>/near_duplicates/[and_self]`

## Syntaxe d'utilisation

`https://api.conditor.fr/<route>/?sort=<liste_de_criteres>` avec`liste_de_critères`, une suite de critères séparés par le caractère espace

Chaque critère possède la sous-syntaxe :

`<field>:<order>:<mode>:<options>`

...avec pour chaque critère :

- `field` : tout champ JSON interrogeable (voir liste brute dans [mapping Elasticsearch](https://github.com/conditor-project/co-config/blob/master/mapping.json))

- `order` : l'ordre du tri ascendant (asc) ou descendant (desc)

- `mode` : le mode d'ordonnancement : `min`,`max`,`median`,`min` ou `avg` selon le type du champ

- `options` : un objet JSON "stringifié" permettant d'utiliser des options spécifiques (comme par exemple `missing_value`)

## Retour de l'API

Ce paramètre n'impacte pas particulièrement le format de retour de l'API. Seul l'ordre des hits renvoyés est modifié.

## Exemples

*Tri descendant sur le champ publicationDate.date (de type date)*

`...?sort=publicationDate.date:desc`

*Double tri, d'abord sur le taux de similarité moyen des doublons d'une notice, puis sur le titre.*

`...?sort=nearDuplicates.similarityRate:avg:{nested:{path:nearDuplicates}} title.default.normalized`
