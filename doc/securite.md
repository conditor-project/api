# Sécurité

[TOC]

## Authentification

La plupart des opérations sur l'API requièrent d'être authentifié. Pour ce faire vous devez contacter l'équipe Conditor afin d'obtenir un jeton JWT.

### JWT

L'API Conditor fonctionne avec un système d'authentification basé sur un jeton sécurisé, un JWT ou JSON Web Token.

Un JWT token prend la forme d'une longue suite de caractères alphanumériques.

Exemple :

```JWT
eyJzdWIiOiAiMTIzNDU2Nzg5MCIsIm5hbWUiOiAiSm9obiBEb2UiLCJpYXQiOiAxN
```

**Durée de vie du token**

Le token a une durée de vie limitée et devient automatiquement invalide. Vous devrez à ce moment là en demander un nouveau.

**Invalidation manuelle du token**

Pour une raison de sécurité, un token peut être invalidé à tout instant, aussi il est important que vous informiez l'hébergeur de l'API si vous jugez que votre token est compromis.  

### Utilisation

**Via le champ `Authorization` dans le header de la requête**

```header
Authorization: Bearer eyJzdWIiOiAiMTI...AxN
```

Par exemple avec `curl` : 

```bash
curl -H "Authorization: Bearer eyJzdWIiOiAiMTI...AxN" https://api.conditor/v1/records
```



**Via le paramètre d'URL `access_token`**

```url
https://api.conditor/v1/records?access_token=eyJzdWIiOiAiMTI...AxN
```



**<u>Note</u>** : La méthode via le header de la requête est préférable pour des raisons de sécurité. 

**<u>Note</u>** :  Les 2 méthodes ne doivent pas êtres utilisées simultanément.
