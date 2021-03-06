# Scroll API

L'API Conditor ne permet pas de récupérer plus de 1000 résultats par requête. La `scroll API` peut être utilisée pour récupérer un grand nombre de résultats (voire tous les résultats), en une série de requêtes itératives.



## `GET`&nbsp;/scroll/&lt;scroll_id&gt;

**Argument de la route**

1. `scroll_id` (string) : Identifiant de la prochaine page de résultats.

**Paramètres d'URL**

1. `scroll` (durationString) : Spécifie combien de temps une représentation consistante sera maintenue pour l'opération de scroll (max: 5m, unités: d|h|m|s|ms|micros|nanos).

**Retourne**

(jsonArray) : Retourne un tableau contenant les résultats sous forme d'objet.

------



Pour mettre en oeuvre le ***Scroll*** vous devez faire une première requête sur une route de l'API en précisant le paramètre `scroll` avec une durée, c'est le temps durant lequel vous aurez accès à la prochaine `page` de résultats. 

Par exemple, si vous souhaitez récupérer les notices de **Hal** marquées en tant que **doublon**:

```url
/records/_filter/hal/duplicate?scroll=5m
```

En réponse, vous obtenez une première page de 10 résultats (X-Result-Count) sur 62075 (X-Total-Count), ainsi qu'un `Scroll-Id`dans les ***Headers***.

```Headers
Scroll-Id:DnF1ZXJ5VGhlbkZldGNoBQAAAAAAe-PdFm11bUpZOVdVVGZLdUtaUDBlajQ4YncAAAAAAHvj3hZtdW1KWTlXVVRmS3VLWlAwZWo0OGJ3AAAAAAB749sWbXVtSlk5V1VUZkt1S1pQMGVqNDhidwAAAAAAe-PcFm11bUpZOVdVVGZLdUtaUDBlajQ4YncAAAAAAHvj2hZtdW1KWTlXVVRmS3VLWlAwZWo0OGJ3
X-Result-Count:10
X-Total-Count:62075
```

Pour obtenir la prochaine page de résultats, passez le `Scroll-Id` en paramètre de la route **/scroll** et répétez l'opération autant de fois que nécessaire.

```Url
/scroll/DnF1ZXJ5VGhlbkZldGNoBQAAAAAAe-PdFm11...TlXVVRmS3VLWlAwZWo0OGJ3
```

**Attention :** Il faut utiliser le Scroll-Id le plus récent à chaque fois car celui-ci est susceptible de changer à chaque requête.

**Note :** Le Scrolling n'est pas conçu pour l'utilisation en temps réel mais plutôt pour récupérer de grandes quantités de données.
