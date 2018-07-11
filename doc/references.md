# Références

[TOC]

## Version de l'API

L'API Conditor inclue dans son URL un numéro de version afin de permettre une meilleur gestion des fonctionnalités dans le temps.

Exemple en version 1 :

```Url
https://api-integ.conditor.fr/v1/records
```

Note : L'URL indiquée ci-dessus est provisoire et faire office d'URL de pré-production. L'URL finale sera https://api.conditor.fr


## Format de la réponse

### JSON

JSON est le principal format de réponse de l'API. Si la requête porte sur une ressource, le format de retour est un `JSON Object`, si c'est une collection de ressources alors un `JSON Array` sera retourné.

### TEI

Il s'agit de la notice TEI Conditor produite à partir de la source originale et utilisée pour alimenter la chaine d'ingestion Conditor.

### ZIP

Vous pouvez récupérer tout ou partie des ressources de l'API sour la forme d'une archive ZIP.



## Headers de la réponse

Les réponses de l'API sont assorties d'un ensemble d'informations spécifiques incluses dans le header.

|Header|  |
| ------------- | :---- |
| X-Total-Count | Total de l'ensemble des ressources sur cette `route` |
| X-Result-Count | Nombre de ressources dans la réponse |
| Scroll-Id | Identifiant pour la `Scroll API` |
| Warning | Avertissement |



## JSON

Le JSON retourné par l'API Conditor est composé de champs extraits de la notice comme `title`, `issn`,  `author`, mais aussi de champs à vocations techniques comme `idConditor`, `ingestId`, `isDuplicate`.

Liste non-exhaustive des champs du JSON:

| Champs      | Type    | Description                                |
| ----------- | ------- | ------------------------------------------ |
| idConditor  | String  | Identifiant Conditor de la notice          |
| ingestId    | String  | Identifiant de la session d'ingestion      |
| isDuplicate | Boolean | Indique si la notice est en doublon        |
| duplicate   | Array   | La liste des `doublons certains`           |
| teiBlob     | Binary  | La notice TEI Conditor encodée en `Base64` |

