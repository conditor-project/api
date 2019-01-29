# Records API

[TOC]



## `GET` /records

Route de récupération d'une collection de notices au format **JSON** dont le nombre dépend de l'argument&nbsp;`size`. La taille maximale de cette collection est de 1000. Pour récupérer plus de notices vous devez utiliser l'API Scroll.

Une recherche plus fine peut etre effectuée grâce au paramètre d'url `q`. Utilisez la [syntax Lucene](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax) pour forger une requête de recherche.

**Paramètres d'URL**

1. `scroll` (durationString) : Spécifie combien de temps une représentation consistante sera maintenue pour l'opération de scroll (max: 5m, unités: d|h|m|s|ms|micros|nanos).

2. `include` (string) : Une liste de champs à extraire et à retourner dans la réponse.

3. `exclude` (string) : Une liste de champs à exclure de la réponse.

4. `page` (number) : le numéro de la page demandé ([voir documentation complète](pagin.md))

5. `page_size` (number) : le nombre de résultats par page, doit être inférieur ou égal à 1000 

6. `q` (string) : Une `Query Lucene` qui permet de filtrer et trier les notices grâce à un score de pertinence.

7. `aggs` (string) : Une [query](aggregations.md) qui permet d'obtenir des aggrégations et statistiques.

8. `sort` (string) : Une expression permettant de [trier](references.md#Tri) une liste de résultats selon un ou plusieurs champ

**Retourne**

(jsonArray) : Retourne un tableau contenant les résultats sous forme d'objet.

**Exemples**

Faire une recherche sur un nom d'auteur :

```url
https://api-integ.conditor.fr/v1/records?q=first3AuthorNames:bob
```


Déclencher un scroll :
```url
https://api-integ.conditor.fr/v1/records?scroll=5m
```
Renvoyer uniquement le champ authors de chaque notice :
```url
https://api-integ.conditor.fr/v1/records?include=authors
```
Renvoyer uniquement les champs authors et idConditor de chaque notice :
```url
https://api-integ.conditor.fr/v1/records?include=authors,idConditor
```
Renvoyer uniquement le sous-champ surname de authors de chaque notice :
```url
https://api-integ.conditor.fr/v1/records?include=authors.surname
```
Exclure le champ authors :
```url
https://api-integ.conditor.fr/v1/records?exclude=authors
```
Cumuler les paramètres `exclude` et `include` :
```url
https://api-integ.conditor.fr/v1/records?include=authors&exclude=authors.surname
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
5. `sort` (string) : Une liste de critères qui permet de [trier](sort.md) la liste des résultats

**Retourne**

(binary) : Retourne une archive ZIP.

**Exemples**

Récupérer toutes les notices dans une archive en incluant uniquement le titre et la date de création.

```url
https://api-integ.conditor.fr/v1/records/zip?include=title,creationDate
```

------



## `GET`&nbsp;/records/_filter/\[&lt;source&gt;\]/\[&lt;year&gt;]<wbr>/\[&lt;duplicate&gt;]<wbr>/\[&lt;nearDuplicate&gt;]

Route de récupération d'une collection de notices au format **JSON** dont le nombre dépend de l'argument&nbsp;`size`. La taille maximale de cette collection est de 1000. Pour récupérer plus de notices vous devez utiliser l'API [Scroll](scroll.md).

La collection peut être filtrée en fonction de différents arguments facultatifs de la route. Ces arguments  doivent respecter l'ordre décrit ci-dessous.
Ce type de filtre n'impacte pas le **score de pertinence**.

Une recherche plus fine peut etre effectuée grâce au paramètre d'url `q`. Utilisez la [syntaxe Lucene](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax) pour forger une requête de recherche.

**Arguments de la route**

1. `source` (string) : Le nom d'un des corpus source de Conditor (ex: sudoc)
2. `year` (string) : Année de publication (ex: 2014)
3. `duplicate` (flagString) : Permet de filtrer les notices marquées en tant que doublon **certain** ou non (flag: **duplicate**|**not_duplicate**)
4. `nearDuplicate` (flagString) : Permet de filtrer les notices marquées en tant que doublon **incertain** ou non (flag: **near_duplicate**|**not_near_duplicate**)

**Paramètres d'URL**

1. `scroll` (durationString) : Spécifie combien de temps une représentation consistante sera maintenue pour l'opération de [scroll](scroll.md) (max: 5m, unités: d|h|m|s|ms|micros|nanos).
2. `include` (string) : Une liste de champs à extraire et retourner dans la réponse.
3. `exclude` (string) : Une liste de champs à exclure de la réponse.
4. `page` (number) : le numéro de la page demandé ([voir documentation complète](pagin.md))
5. `page_size` (number) : le nombre de résultats par page, doit être inférieur ou égal à 1000 
6. `q`(string) : Une `Query Lucene` qui permet de filtrer et trier les notices grâce à un score de pertinence.
7. `aggs` (string) : Une [query](aggregations.md) qui permet d'obtenir des aggrégations et statistiques. 
8. `sort` (string) : Une liste de critères qui permet de [trier](sort.md) la liste des résultats

**Retourne**

(jsonArray) : Retourne un tableau contenant les résultats sous forme d'objet.

**Exemples**

Filtrer la réponse afin de récupérer des notices de hal publiées en 2014 marquées comme non-doublon :

```url
https://api-integ.conditor.fr/v1/records/_filter/hal/2014/not_duplicate
```

Filtrer la réponse afin de récupérer des notices de hal publiées en 2014 marquées comme non-doublon en incluant uniquement l'idConditor :

```url
https://api-integ.conditor.fr/v1/records/_filter/hal/2014/not_duplicate?include=idConditor
```

Filtrer la réponse afin de récupérer les notices publiées en 2014 marquées comme doublon certain et doublon incertain en incluant uniquement l'idConditor et le titre. Le tout filtré par une recherche sur l'auteur :

```url
https://api-integ.conditor.fr/v1/records/_filter/2014/duplicate/near_duplicate?include=idConditor,title&q=first3AuthorNames:bob
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
5. `sort` (string) : Une liste de critères qui permet de [trier](sort.md) la liste des résultats

**Retourne**

(binary) : Retourne une archive ZIP.

**Exemples**

Filtrer la réponse afin de récupérer une archive des notices de hal publiées en 2014 marquées comme non-doublon :

```url
https://api-integ.conditor.fr/v1/records/_filter/hal/2014/not_duplicate/zip
```

Filtrer la réponse afin de récupérer une archive des notices de hal publiées en 2015 marquées comme doublon en incluant uniquement l'idConditor.

```url
https://api-integ.conditor.fr/v1/records/_filter/hal/2015/duplicate/zip?include=idConditor
```

------



## `GET`&nbsp;/records/&lt;id_conditor&gt;

Route de récupération d'une notice identifiée par son idConditor.

**Arguments de la route**

1. `id_conditor` (string) : Identifiant Conditor de la notice recherchée

**Paramètres d'URL**

1. `include` (string) : Une liste de champs à extraire et à retourner dans la réponse.
2. `exclude` (string) : Une liste de champs à exclure de la réponse.
3. `aggs` (string) : Une [query](aggregations.md) qui permet d'obtenir des aggrégations et statistiques.

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



## `GET`&nbsp;/records/&lt;idConditor&gt;/duplicates[/and_self]

Route de récupération des doublons certains d'une notice.

**Arguments de la route**

1. `id_conditor` (string) : Identifiant Conditor de la notice pour laquelle on cherche les doublons certains.
2. L'ajout du fragment d'URL `/and_self` permet d'intégrer les informations de la notice courante (`id_conditor`) à la liste des doublons trouvés

**Paramètres d'URL**

1. `scroll` (durationString) : Spécifie combien de temps une représentation consistante sera maintenue pour l'opération de scroll (max: 5m, unités: d|h|m|s|ms|micros|nanos).

2. `include` (string) : Une liste de champs à extraire et à retourner dans la réponse.

3. `exclude` (string) : Une liste de champs à exclure de la réponse.

4. `page` (number) : le numéro de la page demandé ([voir documentation complète](pagin.md))

5. `page_size` (number) : le nombre de résultats par page, doit être inférieur ou égal à 1000 

6. `q` (string) : Une `Query Lucene` qui permet de filtrer et trier les notices grâce à un score de pertinence.

7. `sort` (string) : Une expression permettant de [trier](references.md#Tri) une liste de résultats selon un ou plusieurs champ

8. `access_token` (string) : [jeton d'identification](securite.md) JWT

9. `debug` : Activation du [mode Debug](references.md#mode-debug)

**Retourne**

(json) : Un tableau d'objets, représentant la liste des doublons, avec pour chacun d'entre eux la version JSON complète de la notice (y compris le champ `teiBlob` qui est la version XML-TEI encodée en base 64)

**Exemple**

La requête suivante renvoie les 2 doublons certains de la notice d'`id_conditor` "XztL5M8At6EdzDumYeJBXr2qg" :

`.../records/XztL5M8At6EdzDumYeJBXr2qg/duplicates`

Réponse de l'API : 

```json
[
    {
        "creationDate": "2019-01-14 15:40:58",
        "title": {
            "default": "3-Deazaneplanocin A (DZNep), an inhibitor of the histone methyltransferase EZH2, induces apoptosis and reduces cell migration in chondrosarcoma cells.",
            ....
        },
        "first3AuthorNames": "Girard Nicolas Bazille Céline Lhuissier Eva",
        "idConditor": "ZF_tOY5Iym25kuFdzk3k9dgNZ",
        "doi": "10.1371/journal.pone.0098176"
        ...
    },
    {
        "creationDate": "2019-01-11 15:13:35",
        "title": {
            "default": "3-Deazaneplanocin A (DZNep), an Inhibitor of the Histone Methyltransferase EZH2, Induces Apoptosis and Reduces Cell Migration in Chondrosarcoma Cells",
            ...
        },
        "first3AuthorNames": "Girard Nicolas Bazille Celine Lhuissier Eva",
        "idConditor": "JPSpXc5ueCubPvY_indVYiGXB",
        "doi": "10.1371/journal.pone.0098176",
        ...
    }
]
```

NB : Dans cet exemple, on a donc 3 notices représentant de manière certaine la même production. Leurs 3 identifiants sont `XztL5M8At6EdzDumYeJBXr2qg`, `ZF_tOY5Iym25kuFdzk3k9dgNZ` et `JPSpXc5ueCubPvY_indVYiGXB`

## `GET`&nbsp;/records/&lt;idConditor&gt;/near_duplicates[/and_self]

Route de récupération des doublons incertains d'une notice.

**Arguments de la route**

1. `id_conditor` (string) : Identifiant Conditor de la notice pour laquelle on cherche les doublons incertains.
2. L'ajout du fragment d'URL `/and_self` permet d'intégrer les informations de la notice courante (`id_conditor`) à la liste des doublons trouvés

**Paramètres d'URL**

1. `scroll` (durationString) : Spécifie combien de temps une représentation consistante sera maintenue pour l'opération de scroll (max: 5m, unités: d|h|m|s|ms|micros|nanos).

2. `include` (string) : Une liste de champs à extraire et à retourner dans la réponse.

3. `exclude` (string) : Une liste de champs à exclure de la réponse.

4. `page` (number) : le numéro de la page demandé ([voir documentation complète](pagin.md))

5. `page_size` (number) : le nombre de résultats par page, doit être inférieur ou égal à 1000 

6. `q` (string) : Une `Query Lucene` qui permet de filtrer et trier les notices grâce à un score de pertinence.

7. `sort` (string) : Une expression permettant de [trier](references.md#Tri) une liste de résultats selon un ou plusieurs champ

8. `access_token` (string) : [jeton d'identification](securite.md) JWT

9. `debug` : Activation du [mode Debug](references.md#mode-debug)


**Retourne**

(json) : Un tableau d'objets, représentant la liste des doublons, avec pour chacun d'entre eux la version JSON complète de la notice (y compris le champ `teiBlob` qui est la version XML-TEI encodée en base 64)

**Exemple**

La requête suivante renvoie les 2 doublons incertains de la notice d'`id_conditor` "XztL5M8At6EdzDumYeJBXr2qg", plus la notice demandée elle-même :

`.../records/LikaDFBCEMhCN7INEEl1ghA1G/near_duplicates/and_self`

Réponse de l'API : 

```json
[
    {
        "creationDate": "2019-01-22 12:00:06",
        "title": {
            "default": "Acoustic Radiation",
            ...
        },
        "idConditor": "LikaDFBCEMhCN7INEEl1ghA1G"
        ...
    },
    {
        "creationDate": "2019-01-22 11:56:29",
        "title": {
            "default": "Acoustic Waves, Propagation",
            ...
        },
        "idConditor": "vBqQsmyu6v7TWvaXuDHDR0EQx",
        ...
    },
    {
        "creationDate": "2019-01-22 12:00:06",
        "title": {
            "default": "Acoustic Waves, Scattering",
            ...
        },
        "idConditor": "1asAH17m8wlzFXgKFh5moNlxI",
        ...
    }  
]
```

NB : Dans cet exemple, on a donc 3 notices représentant de manière incertaine la même production. Leurs 3 identifiants sont `LikaDFBCEMhCN7INEEl1ghA1G`, `vBqQsmyu6v7TWvaXuDHDR0EQx` et `1asAH17m8wlzFXgKFh5moNlxI`

