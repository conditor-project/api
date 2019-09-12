# Validation des doublons incertains (nearDuplicates)

## Principe général

L'API Conditor dispose d'une route permettant de prendre en compte les actions de validation ou non-validation des doublons **incertains** (aussi appelé "nearDuplicates").

Par "validation" ou "non-validation", on entend décision humaine sur 2 notices (ou plus) détectées comme doublons potentiels :

- soit on considère qu'elles représentent bien la même production, et elles deviennent alors "duplicates" (doublons **certains**)
- soit on considère que ce sont des productions différentes : le lien "nearDuplicate" est supprimé et l'action est mémorisée.

## Syntaxe de la requête

Contrairement aux routes d'interrogation (`/records/...`), cette route utilise la méthode HTTP `POST` et prend en entrée un object JSON décrivant les actions souhaitées.

La route à utiliser est `.../v1/duplicatesValidations(?debug)`.

La syntaxe de l'objet attendu dans le body de la requête HTTP est la suivante :

```json
{
    "recordId": idConditor (String),
    "reportDuplicates":
          [idConditor (String)]
        | [{"recordId": idConditor (String), "comment": comment (String max.400)}],
    "reportNonDuplicates":
          [idConditor (String)]
        | [{"recordId": idConditor (String), "comment": comment (String max.400)}]
}
```

Le mode [debug](references.md#mode-debug), permettant d'obtenir plus de précisions en cas d'erreur, peut être utilisé sur cette route.

Note : le header `Content-Type` doit obligatoirement avoir la valeur `application/json`, faute de quoi une erreur `415` est retournée par l'API.

## Description des champs de l'objet JSON

- `recordId` (**obligatoire**) : l'identifiant `idConditor` de la notice à partir de laquelle s'effectue la validation.
- `reportDuplicates` (*facultatif*) : la liste des doublons incertains validés en tant que doublons certains. Ce tableau peut contenir :
  - soit directement l'`idConditor` du doublon
  - soit un objet dont les clés sont `recordId` (l'`idConditor` du doublon) et `comment` (un commentaire de 400 caractères maximum, encodé en UTF-8, permettant d'expliquer la raison du choix de validation, par exemple)
- `reportNonDuplicates` (*facultatif*) : la liste des doublons incertains invalidés, qui ne seront donc plus jamais considérés comme doublons. La forme de ce tableau est identique à celle du champ `reportDuplicates`

*Note* : les champs `reportDuplicates` et `reportNonDuplicates` sont indépendamment facultatifs, mais au moins un des deux doit être renseigné.

## Réponse de l'API

- `201` : "`created`", toutes les actions demandées ont été correctement effectuées
- `400` : Erreur liée à un problème dans la requête. Cela peut être :
  - une erreur de syntaxe JSON mal formé
  - **`invalidRecordsIdsException`**  :  les identifiants indiqués dans `reportDuplicates` et `reportNonDuplicates` doivent obligatoirement figurer dans la collection `nearDuplicates` de la notice `recordId`
  - **`nonUniqueRecordsIdsException`** : l'identifiant d'une notice ne peut pas être renseigné à la fois dans `reportDuplicates` et `reportNonDuplicates`
  - **`duplicatesIntersectionException`** : les identifiants indiqués dans `reportDuplicates` ne doivent pas déjà exister dans la collection `duplicates` de la notice `recordId`
- `404` : la notice `recordId` n'a pas été trouvée
- `415` : le header `Content-Type` de la requête est différent de `application/json`

*Note* : les doublons validés seront déplacés dans la collection `duplicates` de la notice d'origine, et enrichis d'un booléen `isValidatedByUser: true`. Ce dernier permet de distinguer les doublons certains issus d'un traitement automatique de ceux issus d'une validation humaine.

## Exemple

(les identifiants utilisés n'existent pas et sont purement illustratifs)

Supposons que la notice d'`idConditor` "`id1`" contienne les champs suivants :

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
    "recordId": "id1",
    "reportDuplicates": [
        "id2",
        {"recordId":"id3", "comment":"le fulltext PDF disponible sur les plateformes sources montrent que les documents sont identiques"}
    ],
    "reportNonDuplicates": [
        {"recordId": "id5", "comment": "Rien à voir, il s'agit d'actes de 2 conférences ayant eu lieu à 10 ans d'intervalle" }
    ]
}
```

La notice `id1` après les traitements contiendra les champs suivants :

```json
duplicates : [
    {idConditor: "id4", source: "s1"}
    {idConditor: "id2", source: "s2", isValidatedByUser:true},
    {idConditor: "id3", source: "s3", isValidatedByUser:true},
],
nearDuplicates : [
    {idConditor: "id6", source: "s1"}
]
```

Les notices `id2`, `id3`, `id4` et `id5` seront mises à jour en conséquence pour refléter les actions effectuées.

Comme tout s'est bien passé, l'API renvoie un code `201`.
