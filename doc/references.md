# Références

[TOC]

## Format de la réponse

### JSON

C'est le principale format de réponse de l'API. Si la requête porte sur une ressource unique, le format de retour est un `JSON Object`, si c'est une collection de ressource alors c'est un `JSON Array` qui sera retourné.

### TEI

Il s'agit de la TEI original.

### ZIP

Vous pouvez recuperer tout ou partie des ressources de l'API sour la forme d'une archive ZIP.



## Headers de la  réponse

Les réponses de L'API sont assorties d'un ensemble d'informations spécifiques incluses dans le header.

|Header|  |
| ------------- | :---- |
| X-Total-Count | Total de l'ensemble des ressources sur cette `route` |
| X-Result-Count | Nombre de ressource dans la réponse |
| Scroll-Id | Identifiant pour la `Scroll API` |
| Warning | Avertissement |

