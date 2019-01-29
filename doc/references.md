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

Le JSON retourné par l'API Conditor est composé de champs extraits de la notice comme `title`, `issn`,  `first3AuthorNames`, mais aussi de champs à vocations techniques comme `idConditor`, `sessionName`, `isDuplicate`.

Liste non-exhaustive des champs du JSON:

| Champs      | Type    | Description                                |
| ----------- | ------- | ------------------------------------------ |
| idConditor  | String  | Identifiant Conditor de la notice          |
| sessionName | String  | Identifiant de la session d'ingestion      |
| isDuplicate | Boolean | Indique si la notice est `doublon certain` d'une autre notice |
| isNearDuplicate | Boolean | Indique si la notice est `doublon incertain` d'une autre notice |
| duplicates   | Array   | La liste des `doublons certains`           |
| nearDuplicates | Array | La liste des `doublons incertains` |
| teiBlob     | Binary  | La notice TEI Conditor encodée en `Base64` |

## Mode Debug

Par défaut, quand l'API renvoie une erreur (400, par exemple), les infos retournés sont minimales et pas forcément explicites pour quelqu'un qui ne connaît pas bien l'API. 

Pour pallier ce défaut, le mode "debug" permet de demander à l'API de renvoyer plus de détails dans le message d'erreur retourné.

Pour ce faire, il suffit d'utiliser le paramètre d'URL `debug` (sans valeur).

Par exemple, sur la requête suivante

`https://api.conditor.fr/v1/records?page_size=465465465`

L'API renvoie le code de retour HTTP 400 ainsi que le message "Bad Request".

Avec le paramètre debug :

`https://api.conditor.fr/v1/records?page_size=465465465&debug`

Le message retourné devient :

```json
{
    "errors": [
        {
            "status": 400,
            "statusName": "Bad Request",
            "name": "sizeTooHighException",
            "message": "The required size 465465465 exceed the maximum  1000"
        }
    ]
}
```
