# Records API

[TOC]



## `GET` /records

Route de récupération d'une collection de notices au format **JSON** dont le nombre dépend de l'argument&nbsp;`size`. La taille maximale de cette collection est de 1000. Pour récupérer plus de notices vous devez utiliser l'API Scroll.

Une recherche plus fine peut etre effectuée grâce au paramètre d'url `q`. Utilisez la [syntax Lucene](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax) pour forger une requête de recherche.

**Paramètres d'URL**

1. `scroll` (durationString) : Spécifie combien de temps une représentation consistante sera maintenue pour l'opération de scroll (max: 5m, unités: d|h|m|s|ms|micros|nanos).

2. `include` (string) : Une liste de champs à extraire et à retourner dans la réponse.

3. `exclude` (string) : Une liste de champs à exclure de la réponse.

4. `size` (number) : Nombre de résultats à retourner (défaut: 10, max: 1000)

5. `q` (string) : Une `Query Lucene` qui permet de filtrer et trier les notices grâce à un score de pertinence.

     

**Retourne**

(jsonArray) : Retourne un tableau contenant les résultats sous forme d'objet.

**Exemples**

Faire une recherche sur un nom d'auteur :

```url
https://api-integ.conditor.fr/v1/records?q=author:bob
```


Déclencher un scroll :
```url
https://api-integ.conditor.fr/v1/records?scroll=5m
```
Renvoyer uniquement le champ authorRef de chaque notice :
```url
https://api-integ.conditor.fr/v1/records?include=authorRef
```
Renvoyer uniquement les champs authorRef et idConditor de chaque notice :
```url
https://api-integ.conditor.fr/v1/records?include=authorRef,idConditor
```
Renvoyer uniquement le sous-champ surname de authorRef de chaque notice :
```url
https://api-integ.conditor.fr/v1/records?include=authorRef.surname
```
Exclure le champ authorRef :
```url
https://api-integ.conditor.fr/v1/records?exclude=authorRef
```
Cumuler les paramètres `exclude` et `include` :
```url
https://api-integ.conditor.fr/v1/records?include=authorRef&exclude=authorRef.surname
```
Choisir nombre de résultats retournés :
```url
https://api-integ.conditor.fr/v1/records?size=100
```

------



## `GET` /records/zip

Route de récupération des notices de la base Conditor dans une **archive ZIP**. Chaque notice est stockée au format JSON dans un fichier nommé d'après l'idConditor.

Une recherche plus fine peut etre effectuée grâce au paramètre d'url `q`. Utilisez la [syntaxe Lucene](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax) pour forger une requête de recherche.

**Paramètres d'URL**

1. `include` (string) : Une liste de champs à extraire et à retourner dans la réponse.
2. `exclude` (string) : Une liste de champs à exclure de la réponse.
3. `q` (string) : Une `Query Lucene` qui permet de filtrer et trier les notices grâce à un score de pertinence.
4. `limit`(number): Limlt le nombre de résultat renvoyer dans l'archive ZIP.

**Retourne**

(binary) : Retourne une archive ZIP.

**Exemples**

Récupérer toutes les notices dans une archive en incluant uniquement le titre et la date de création.

```url
https://api-integ.conditor.fr/v1/records/zip?include=title,creationDate
```

------



## `GET`&nbsp;/records/_filter/\[&lt;source&gt;\]/\[&lt;year&gt;]<wbr>/\[&lt;duplicate&gt;]<wbr>/\[&lt;nearDuplicate&gt;]

Route de récupération d'une collection de notices au format **JSON** dont le nombre dépend de l'argument&nbsp;`size`. La taille maximale de cette collection est de 1000. Pour récupérer plus de notices vous devez utiliser l'API Scroll.

La collection peut être filtrée en fonction de différents arguments facultatifs de la route. Ces arguments  doivent respecter l'ordre décrit ci-dessous.
Ce type de filtre n'impacte pas le **score de pertinence**.

Une recherche plus fine peut etre effectuée grâce au paramètre d'url `q`. Utilisez la [syntaxe Lucene](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax) pour forger une requête de recherche.

**Arguments de la route**

1. `source` (string) : Le nom d'un des corpus source de Conditor (ex: sudoc)
2. `year` (string) : Année de publication (ex: 2014)
3. `duplicate` (flagString) : Permet de filtrer les notices marquées en tant que doublon **certain** ou non (flag: **duplicate**|**not_duplicate**)
4. `nearDuplicate` (flagString) : Permet de filtrer les notices marquées en tant que doublon **incertain** ou non (flag: **near_duplicate**|**not_near_duplicate**)

**Paramètres d'URL**

1. `scroll` (durationString) : Spécifie combien de temps une représentation consistante sera maintenue pour l'opération de scroll (max: 5m, unités: d|h|m|s|ms|micros|nanos).
2. `include` (string) : Une liste de champs à extraire et retourner dans la réponse.
3. `exclude` (string) : Une liste de champs à exclure de la réponse.
4. `size` (number) : Nombre de résultats à retourner (défaut: 10, max: 1000)
5. `q`(string) : Une `Query Lucene` qui permet de filtrer et trier les notices grâce à un score de pertinence.

**Retourne**

(jsonArray) : Retourne un tableau contenant les résultats sous forme d'objet.

**Exemples**

Filtrer la réponse afin de récupérer des notices de hal publiées en 2014 marquées comme non-doublon :

```url
https://api-integ.conditor.fr/v1/records/hal/2014/not_duplicate
```

Filtrer la réponse afin de récupérer des notices de hal publiées en 2014 marquées comme non-doublon en incluant uniquement l'idConditor :

```url
https://api-integ.conditor.fr/v1/records/hal/2014/not_duplicate?include=idConditor
```

Filtrer la réponse afin de récupérer les notices publiées en 2014 marquées comme doublon certain et doublon incertain en incluant uniquement l'idConditor et le titre. Le tout filtré par une recherche sur l'auteur :

```url
https://api-integ.conditor.fr/v1/records/2014/duplicate/near_duplicate?include=idConditor,title&q=author:bob
```

------



## `GET`&nbsp;/records/_filter/\[&lt;source&gt;\]/\[&lt;year&gt;]<wbr>/\[&lt;duplicate&gt;]<wbr>/\[&lt;nearDuplicate&gt;]<wbr>/zip

Route de récupération d'une collection de notices dans une **archive ZIP**. Chaque notice est stockée au format JSON dans un fichier nommé d'après l'idConditor.

La collection peut être filtrée en fonction de différents arguments facultatifs de la route. Ces arguments  doivent respecter l'ordre décrit ci-dessous.
Ce type de filtre n'impacte pas le **score de pertinence**.

Une recherche plus fine peut etre effectuée grâce au paramètre d'url `q`. Utilisez la [syntaxe Lucene](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax) pour forger une requête de recherche.

**Arguments de la route**

1. `source` (string) : Le nom d'un des corpus source de Conditor (ex: sudoc)
2. `year` (string) : Année de publication (ex: 2014)
3. `duplicate` (flagString) : Permet de filtrer les notices marquées en tant que doublon **certain** ou non (flag: **duplicate**|**not_duplicate**)
4. `nearDuplicate` (flagString) : Permet de filtrer les notices marquées en tant que doublon **incertain** ou non (flag: **near_duplicate**|**not_near_duplicate**)

**Paramètres d'URL**

1. `include` (string) : Une liste de champs à extraire et à retourner dans la réponse.
2. `exclude` (string) : Une liste de champs à exclure de la réponse.
3. `q` (string) : Une `Query Lucene` qui permet de filtrer et trier les notices grâce à un score de pertinence.
4. `limit`(number): Limlt le nombre de résultat renvoyer dans l'archive ZIP.

**Retourne**

(binary) : Retourne une archive ZIP.

**Exemples**

Filtrer la réponse afin de récupérer une archive des notices de hal publiées en 2014 marquées comme non-doublon :

```url
https://api-integ.conditor.fr/v1/records/hal/2014/not_duplicate/zip
```

Filtrer la réponse afin de récupérer une archive des notices de hal publiées en 2015 marquées comme doublon en incluant uniquement l'idConditor.

```url
https://api-integ.conditor.fr/v1/records/hal/2015/duplicate/zip?include=idConditor
```

------



## `GET`&nbsp;/records/&lt;id_conditor&gt;

Route de récupération d'une notice identifiée par son idConditor.

**Arguments de la route**

1. `id_conditor` (string) : Identifiant Conditor de la notice recherchée

**Paramètres d'URL**

1. `include` (string) : Une liste de champs à extraire et à retourner dans la réponse.
2. `exclude` (string) : Une liste de champs à exclure de la réponse.

**Retourne**

(jsonObject) : Retourne une unique notice sous la forme d'un objet JSON .

**Exemples**

Récupérer une notice identifiée :

```url
https://api-integ.conditor.fr/v1/records/xXFCmTU2kwDkCTJlyQz1gOgBz
```
Récupérer une notice identifiée et extraire le champ title :

```url
https://api-integ.conditor.fr/v1/records/xXFCmTU2kwDkCTJlyQz1gOgBz?include=title
```

------



## `GET`&nbsp;/records/&lt;id_conditor&gt;/tei

Route de récupération du TEI d'une notice identifiée.

**Arguments de la route**

1. `id_conditor` (string) : Identifiant Conditor de la notice recherchée

**Retourne**

(tei) : Retourne le fichier TEI-Conditor de la notice.

**Exemples**

Récupérer le TEI d'une notice identifiée :

```url
https://api-integ.conditor.fr/v1/records/xXFCmTU2kwDkCTJlyQz1gOgBz/tei
```