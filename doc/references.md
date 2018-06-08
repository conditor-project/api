# Références

[TOC]

## Format de la réponse

### JSON

JSON est le principal format de réponse de l'API. Si la requête porte sur une ressource, le format de retour est un `JSON Object`, si c'est une collection de ressources alors un `JSON Array` sera retourné.

### TEI

Il s'agit du TEI original.

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

