# Validation des doublons incertains (nearDuplicates)

## Principe général

L'API Conditor dispose d'une route permettant de prendre en compte les actions de validation ou non-validation des doublons **incertains** (aussi appelé "nearDuplicates").

Par "validation" ou "non-validation", on entend décision humaine sur 2 notices (ou plus) taggées "nearDuplicates" entre elles :
  - soit on considère qu'elles représentent bien la même production, et elles deviennent alors "duplicates" (doublons **certains**)
  - soit on considère que ce sont des productions différentes : le lien "nearDuplicate" est supprimé et l'action est mémorisée.

## Syntaxe de la requête

Contrairement aux routes d'interrogation (`/records/...`), cette route utilise la méthode HTTP `POST` et prend en entrée un object JSON décrivant les actions souhaitées.

La route à utiliser est `.../v1/duplicatesValidations(?debug)`.

La syntaxe de l'objet attendu dans le body de la requête HTTP est la suivante :

```json
{
    "initialRecord": <String> idConditor,
    "reportDuplicates": 
          [<String> idConditor]
        | [{"idConditor":<String>, "comment":<String 400>}],
    "reportNonDuplicates": 
          [<String> idConditor]
        | [{"idConditor":<String>, "comment":<String 400>}]
}
```

Le mode [debug](references.md#mode-debug), permettant d'obtenir plus de précisions en cas d'erreur, peut être utilisé sur cette route.


## Description des champs de l'objet JSON

  - `initialRecord` (**obligatoire**) : l'identifiant `idConditor` de la notice à partir de laquelle s'effectue la validation.
  - `reportDuplicates` (*facultatif*) : la liste des doublons incertains validés en tant que doublons certains. Ce tableau peut contenir :
    - soit directement l'`idConditor` du doublon
    - soit un objet dont les clés sont `idConditor` et `comment` (un commentaire de 400 caractères maximum, encodé en UTF-8, permettant d'expliquer la raison du choix de validation, par exemple)
  - `reportNonDuplicates` (*facultatif*) : la liste des doublons incertains invalidés, qui ne seront donc plus jamais considérés comme doublons. La forme de ce tableau est identique à celle du champ `reportDuplicates`

*Note* : les champs `reportDuplicates` et `reportNonDuplicates` sont indépendemment facultatifs, mais au moins un des deux doit être renseigné.

## Réponse de l'API



## Exemple

(les identifiants utilisés n'existent pas et sont purement illustratifs)

Supposons que la notice d'`idConditor` "`id1`" contiennent les champs suivants :

```json
duplicates : [
    {idConditor: "id4", source: "s1"}
],
nearDuplicates : [
    {idConditor: "id2", source: "s2"},
    {idConditor: "id3", source: "s3"},
    {idConditor: "id5", source: "s1"},
    {idConditor: "id6", source: "s1"}
]
```

On peut alors choisir de valider les n-uplets `id1-id2-id3`, et d'invalider le doublon `id1-id5`. Le choix sur le doublon `id1-id6` sera effectué ultérieurement.

La requête à envoyer à l'API est donc la suivante :

```json
POST https://api.conditor.fr/v1/duplicatesValidations?debug
{
    "initialRecord": "id1",
    "reportDuplicates": [
        "id2",
        {"idConditor":"id3", "comment":"le fulltext PDF disponible sur les plateformes sources montrent que les documents sont identiques"}
    ],
    "reportNonDuplicates": [
        {"idConditor": "id5", "comment": "Rien à voir, il s'agit d'actes de 2 conférences ayant eu lieu à 10 ans d'intervalle" }
    ]
}
```

La notice `id1` après les traitements contiendra les champs suivants 

```json
duplicates : [
    {idConditor: "id4", source: "s1"}
    {idConditor: "id2", source: "s2"},
    {idConditor: "id3", source: "s3"},
],
nearDuplicates : [
    {idConditor: "id6", source: "s1"}
]
```

Les notices `id2`, `id3`, `id4` et `id5` seront mises à jour en conséquence pour refléter les actions effectuées.

Commen tout s'est bien passé, l'API renvoie un code 200.