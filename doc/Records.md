# Records API

## `GET` /<api_version>/records/json

Route de récupération d'une collection de notices au format JSON dont le nombre dépend de l'argument&nbsp;`size`. La taille maximale de cette collection est de 1000, pour récuperer plus de notices vous devez utiliser l'API Scroll.

**Parametres d'url**

1. `api_version` (string): La version majeur de l'API (ex: v1)  

**Arguments de la requête**

1. `scroll` (durationString): Specifie combien de temps une representation consistante sera maintenue pour l'operation de scroll (max: 5m, unitées: d|h|m|s|ms|micros|nanos).
2. `includes` (string): Une liste de champs à extraire et retourner dans le réponse.
3. `excludes` (string): Une list de champs à exclure de la réponse.
4. `size` (number): Nombre de resultat retourner (defaut: 10, max: 1000)

**Retourne**

(jsonArray): Retourne un tableau contenant les résultats sous forme d'objet.


**Exemples**


Déclencher un scroll:
```url
/v1/records/json?scroll=5m
```
Filtre sur le champs authorRef:
```url
/v1/records/json?includes=authorRef
```
Filtre sur les champs authorRef et idConditor:
```url
/v1/records/json?includes=authorRef,idConditor
```
Filtre sur le sous champs surname de authorRef:
```url
/v1/records/json?includes=authorRef.surname
```
Exclusion du champs authorRef
```url
/v1/records/json?excludes=authorRef
```
On peut cumuler excludes et includes
```url
/v1/records/json?includes=authorRef&excludes=authorRef.surname
```
Choix du nombre de résultat retourné
```url
/v1/records/json?size=100
```



## `GET` /<api_version>/records

Alias de la route `GET` /<api_version>/records/json



## `GET`&nbsp;/<api_version>/records/\[\<source>]/\[\<year>]/<br />\[\<duplicate>]/json

Route de récuperation d'une collection de notices au format JSON dont le nombre dépend de l'argument&nbsp;`size`. La taille maximale de cette collection est de 1000, pour récuperer plus de notices vous devez utiliser l'API Scroll.

La collection peut être filtrée en fonction de différents parametres d'url facultatifs mais qui doivent respecter l'ordre decrit ci-contre.

**Parametres d'url**

1. `api_version` (string): La version majeur de l'API (ex: v1)
2. `source` (string): Le nom d'un des corpus source de Conditor (ex: wos)
3. `year` (string): Année de publication (ex: 2014)
4. `duplicate` (flagString): Permet de filtrer les notices marquées en tant que doublon ou non doublon (flag: duplicate|not_duplicate)

**Arguments de la requête**

1. `scroll` (durationString): Specifie combien de temps une representation consistante sera maintenue pour l'operation de scroll (max: 5m, unitées: d|h|m|s|ms|micros|nanos).
2. `includes` (string): Une liste de champs à extraire et retourner dans le réponse.
3. `excludes` (string): Une list de champs à exclure de la réponse.
4. `size` (number): Nombre de resultat retourner (defaut: 10, max: 1000)

**Retourne**

(jsonArray): Retourne un tableau contenant les résultats sous forme d'objet.

**Exemples**

Filtrer la réponse afin de récuperer des notices de hal de 2014 marquées comme non doublon:

```url
/v1/records/hal/2014/not_duplicate/json
```

Filtrer la réponse afin de récuperer des notices de hal de 2014 marquées comme non doublon en incluant uniquement l'idConditor:

```url
/v1/records/hal/2014/not_duplicate/json?includes=idConditor
```



## `GET`&nbsp;/<api_version>/records/\[\<source>]/\[\<year>]/<br />\[\<duplicate>]

Alias de la route `GET`&nbsp;/<api_version>/records/\[\<source>]/\[\<year>]/\[\<duplicate>]/json



## `GET`&nbsp;/<api_version>/records/\[\<source>]/\[\<year>]/<br />\[\<duplicate>]/zip

Route de récuperation d'une collection de notices dans une archive ZIP. Chaque notice est stockée au format JSON dans un fichier nommé d'apres l'idConditor.

**Parametres d'url**

1. `api_version` (string): La version majeur de l'API (ex: v1)
2. `source` (string): Le nom d'un des corpus source de Conditor (ex: wos)
3. `year` (string): Année de publication (ex: 2014)
4. `duplicate` (flagString): Permet de filtrer les notices marquées en tant que doublon ou non doublon (flag: duplicate|not_duplicate)

**Arguments de la requête**

1. `includes` (string): Une liste de champs à extraire et retourner dans le réponse.
2. `excludes` (string): Une list de champs à exclure de la réponse.

**Retourne**

(binary): Retourne une archive ZIP.

**Exemples**

Filtrer la réponse afin de récuperer des notices de hal de 2014 marquées comme non doublon:

```url
/v1/records/hal/2014/not_duplicate/zip
```

Filtrer la réponse afin de récuperer des notices de hal de 2014 marquées comme non doublon en incluant uniquement l'idConditor.

```url
/v1/records/hal/2014/not_duplicate/zip?includes=idConditor
```



## `GET` /<api_version>/records/zip

Route de récuperation de **l'integralité des notices** de la base Conditor dans une archive ZIP. Chaque notice est stockée au format JSON dans un fichier nommé d'apres l'idConditor.

**Parametres d'url**

1. `api_version` (string): La version majeur de l'API (ex: v1)

**Arguments de la requête**

1. `includes` (string): Une liste de champs à extraire et retourner dans le réponse.
2. `excludes` (string): Une list de champs à exclure de la réponse.

**Retourne**

(binary): Retourne une archive ZIP.

**Exemples**

Récuperer toutes les notices dans une archive en incluant uniquement le titre et de la date de création.

```url
/v1/records/zip?includes=title,creationDate
```



## `GET` /<api_version>/records/\<id_conditor\>/json

Route de récuperation d'une notice identifiée par son idConditor.

**Parametres d'url**

1. `api_version` (string): La version majeur de l'API (ex: v1)
2. `id_conditor` (string): Identifiant Conditor de la notice recherchée

**Arguments de la requête**

1. `includes` (string): Une liste de champs à extraire et retourner dans le réponse.
2. `excludes` (string): Une list de champs à exclure de la réponse.

**Retourne**

(jsonObject): Retourne une unique notice sous la forme d'un objet JSON .

**Exemples**

Récuperer une notice identifiée:

```url
/v1/records/xXFCmTU2kwDkCTJlyQz1gOgBz/json
```
Récuperer une notice identifiée et filtre sur le champs title:

```url
/v1/records/xXFCmTU2kwDkCTJlyQz1gOgBz/json?includes=title
```



## `GET` /<api_version>/records/\<id_conditor\>

Alias de la route `GET` /<api_version>/records/\<id_conditor\>/json



## `GET` /<api_version>/records/\<id_conditor\>/tei

Route de récuperation du TEI d'une notice identifiée.

**Parametres d'url**

1. `api_version` (string): La version majeur de l'API (ex: v1)
2. `id_conditor` (string): Identifiant Conditor de la notice recherchée

**Retourne**

(tei): Retourne le TEI de la notice .

**Exemples**

Récuperer le TEI d'une notice identifiée:

```url
/v1/records/xXFCmTU2kwDkCTJlyQz1gOgBz/tei
```
