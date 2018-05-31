# Records API

## `GET` /<api_version>/records/json

Route de récupération d'une collection de notices au format JSON dont le nombre dépend de l'argument&nbsp;`size`. La taille maximale de cette collection est de 1000. Pour récupérer plus de notices vous devez utiliser l'API Scroll.

**Paramètres d'URL**

1. `api_version` (string) : La version majeure de l'API (ex: v1)  

**Arguments de la requête**

1. `scroll` (durationString) : Spécifie combien de temps une représentation consistante sera maintenue pour l'opération de scroll (max: 5m, unités: d|h|m|s|ms|micros|nanos).
2. `includes` (string) : Une liste de champs à extraire et à retourner dans la réponse.
3. `excludes` (string) : Une liste de champs à exclure de la réponse.
4. `size` (number) : Nombre de résultats à retourner (défaut: 10, max: 1000)

**Retourne**

(jsonArray) : Retourne un tableau contenant les résultats sous forme d'objet.


**Exemples**


Déclencher un scroll :
```url
/v1/records/json?scroll=5m
```
Filtre sur le champ authorRef :
```url
/v1/records/json?includes=authorRef
```
Filtre sur les champs authorRef et idConditor :
```url
/v1/records/json?includes=authorRef,idConditor
```
Filtre sur le sous-champ surname de authorRef :
```url
/v1/records/json?includes=authorRef.surname
```
Exclusion du champ authorRef :
```url
/v1/records/json?excludes=authorRef
```
On peut cumuler excludes et includes :
```url
/v1/records/json?includes=authorRef&excludes=authorRef.surname
```
Choix du nombre de résultats retournés :
```url
/v1/records/json?size=100
```



## `GET` /<api_version>/records

Alias de la route `GET` /<api_version>/records/json



## `GET`&nbsp;/<api_version>/records/\[\<source>]/\[\<year>]/<br />\[\<duplicate>]/json

Route de récupération d'une collection de notices au format JSON dont le nombre dépend de l'argument&nbsp;`size`. La taille maximale de cette collection est de 1000. Pour récupérer plus de notices vous devez utiliser l'API Scroll.

La collection peut être filtrée en fonction de différents paramètres d'URL facultatifs mais qui doivent respecter l'ordre décrit ci-dessous.

**Paramètres d'URL**

1. `api_version` (string) : La version majeure de l'API (ex: v1)
2. `source` (string) : Le nom d'un des corpus source de Conditor (ex: sudoc)
3. `year` (string) : Année de publication (ex: 2014)
4. `duplicate` (flagString) : Permet de filtrer les notices marquées en tant que doublon ou non-doublon (flag: duplicate|not_duplicate)

**Arguments de la requête**

1. `scroll` (durationString) : Spécifie combien de temps une représentation consistante sera maintenue pour l'opération de scroll (max: 5m, unités: d|h|m|s|ms|micros|nanos).
2. `includes` (string) : Une liste de champs à extraire et retourner dans la réponse.
3. `excludes` (string) : Une liste de champs à exclure de la réponse.
4. `size` (number) : Nombre de résultats à retourner (défaut: 10, max: 1000)

**Retourne**

(jsonArray) : Retourne un tableau contenant les résultats sous forme d'objet.

**Exemples**

Filtrer la réponse afin de récupérer des notices de hal publiées en 2014 marquées comme non-doublon :

```url
/v1/records/hal/2014/not_duplicate/json
```

Filtrer la réponse afin de récupérer des notices de hal publiées en 2014 marquées comme non-doublon en incluant uniquement l'idConditor :

```url
/v1/records/hal/2014/not_duplicate/json?includes=idConditor
```



## `GET`&nbsp;/<api_version>/records/\[\<source>]/\[\<year>]/<br />\[\<duplicate>]

Alias de la route `GET`&nbsp;/<api_version>/records/\[\<source>]/\[\<year>]/\[\<duplicate>]/json



## `GET`&nbsp;/<api_version>/records/\[\<source>]/\[\<year>]/<br />\[\<duplicate>]/zip

Route de récupération d'une collection de notices dans une archive ZIP. Chaque notice est stockée au format JSON dans un fichier nommé d'après l'idConditor.

**Paramètres d'URL**

1. `api_version` (string) : La version majeure de l'API (ex: v1)
2. `source` (string) : Le nom d'un des corpus source de Conditor (ex: sudoc)
3. `year` (string) : Année de publication (ex: 2014)
4. `duplicate` (flagString) : Permet de filtrer les notices marquées en tant que doublon ou non-doublon (flag: duplicate|not_duplicate)

**Arguments de la requête**

1. `includes` (string) : Une liste de champs à extraire et à retourner dans la réponse.
2. `excludes` (string) : Une liste de champs à exclure de la réponse.

**Retourne**

(binary) : Retourne une archive ZIP.

**Exemples**

Filtrer la réponse afin de récupérer des notices de hal publiées en 2014 marquées comme non-doublon :

```url
/v1/records/hal/2014/not_duplicate/zip
```

Filtrer la réponse afin de récupérer des notices de hal publiées en 2014 marquées comme non-doublon en incluant uniquement l'idConditor.

```url
/v1/records/hal/2014/not_duplicate/zip?includes=idConditor
```



## `GET` /<api_version>/records/zip

Route de récupération de **l'intégralité des notices** de la base Conditor dans une archive ZIP. Chaque notice est stockée au format JSON dans un fichier nommé d'après l'idConditor.

**Parametres d'URL**

1. `api_version` (string) : La version majeure de l'API (ex: v1)

**Arguments de la requête**

1. `includes` (string) : Une liste de champs à extraire et à retourner dans le réponse.
2. `excludes` (string) : Une liste de champs à exclure de la réponse.

**Retourne**

(binary) : Retourne une archive ZIP.

**Exemples**

Récupérer toutes les notices dans une archive en incluant uniquement le titre et  la date de création.

```url
/v1/records/zip?includes=title,creationDate
```



## `GET` /<api_version>/records/\<id_conditor\>/json

Route de récupération d'une notice identifiée par son idConditor.

**Paramètres d'URL**

1. `api_version` (string) : La version majeure de l'API (ex: v1)
2. `id_conditor` (string) : Identifiant Conditor de la notice recherchée

**Arguments de la requête**

1. `includes` (string) : Une liste de champs à extraire et à retourner dans la réponse.
2. `excludes` (string) : Une liste de champs à exclure de la réponse.

**Retourne**

(jsonObject): Retourne une unique notice sous la forme d'un objet JSON .

**Exemples**

Récupérer une notice identifiée :

```url
/v1/records/xXFCmTU2kwDkCTJlyQz1gOgBz/json
```
Récupérer une notice identifiée et filtrée sur le champ title :

```url
/v1/records/xXFCmTU2kwDkCTJlyQz1gOgBz/json?includes=title
```



## `GET` /<api_version>/records/\<id_conditor\>

Alias de la route `GET` /<api_version>/records/\<id_conditor\>/json



## `GET` /<api_version>/records/\<id_conditor\>/tei

Route de récupération du TEI d'une notice identifiée.

**Paramètres d'URL**

1. `api_version` (string) : La version majeure de l'API (ex: v1)
2. `id_conditor` (string) : Identifiant Conditor de la notice recherchée

**Retourne**

(tei) : Retourne le fichier TEI-Conditor de la notice.

**Exemples**

Récupérer le TEI d'une notice identifiée :

```url
/v1/records/xXFCmTU2kwDkCTJlyQz1gOgBz/tei
```
