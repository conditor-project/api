# Pagination

Le mécanisme de pagination est un mode de parcours d'une liste de résultats typiquement destiné à l'usage des IHM. Il permet de récupérer des "pages" de résultats, et de naviguer entre ces pages dans un sens ou dans l'autre. 

**Note :** Ce mécanisme ne doit pas être utilisé pour parcourir de grands ensembles de résultats. Une limitation technique empêche d'accéder au-delà du 10000ème résultat. Cette fonctionnalité s'appuie sur l'utilisation des paramètres `from` et `size` [du moteur de recherche Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/6.x/search-request-from-size.html).

## Liste des routes supportant la pagination

- `/records`
- `/records/_filter/[<source>]/[<year>]/[<duplicate>]/[<nearDuplicate>]`
- `/records/<idConditor>/duplicates/[and_self]`
- `/records/<idConditor>/near_duplicates/[and_self]`


## Utilisation

**Paramètres d'URL**

1. `page` (number) : le numéro de la page demandée
2. `page_size` (number) : le nombre de résultats par page, doit être inférieur ou égal à 1000 

**Limitations**

Il est impossible d'accéder aux résultats au-delà du 10000ème rang.

**Retour de l'API**

(jsonArray) : Retourne un tableau contenant les résultats sous forme d'objet.

## Exemple

Si vous souhaitez récupérer 5 notices du corpus **Hal**, en partant de la 3ème page:

```url
.../records/_filter/hal/?page_size=5&page=3
```

En réponse vous obtenez dans les ***headers*** HTTP :

- le nombre de résulats retournés : 5 (X-Result-Count) 
- le nombre total réponses correspondant : 93174 (X-Total-Count)
- une liste de liens utilisables directement (Link), permettant d'accéder aux pages "suivantes", "précédentes", "première page" et "dernière page".

Headers retournés correspondant à cet exemple :

```Headers
Link:<https://api.conditor.fr/v1/records/_filter/hal?page=1&page_size=5>; rel="first", <https://api.conditor.fr/v1/records/_filter/hal?page=2&page_size=5>; rel="prev", <https://api.conditor.fr/v1/records/_filter/hal?page=4&page_size=5>; rel="next", <https://api.conditor.fr/v1/records/_filter/hal?page=2000&page_size=5>; rel="last"
X-Result-Count:5
X-Total-Count:93174
```

