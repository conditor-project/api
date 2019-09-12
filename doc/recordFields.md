# Champs du JSON

Le JSON retourné par l'API Conditor est composé de champs extraits de la notice comme `title`, `issn`,  `first3AuthorNames`, mais aussi 
de champs à vocations techniques comme `idConditor`, `sessionName`, `isDuplicate`.

Liste des champs du JSON par ordre alphabétique :

| Champs      | Type    | Description                                | Champs Conditor                            |
| ----------- | ------- | ------------------------------------------ | ------------------------------------------ |
| _score | number | score d'ElasticSearch en fonction de la requête | x | 
| abstract | String | résumé |  | 
| articleNumber | String | numéro d'article |  | 
| arxiv | String | identifiant du document arxiv |  | 
| authorNames | String | tous les noms d'auteurs sans séparateurs |  | 
| authors.affiliations.address | String | adresse de l'auteur |  | 
| authors.affiliations.ref | String | identifiant AuréHal de la structure |  | 
| authors.forename | String | nom de l'auteur |  | 
| authors.halAuthorId | String | identifiant Hal de l'auteur |  | 
| authors.idHal | String | identifiant Hal de l'auteur regroupant les halAuthorId |  | 
| authors.idRef | String | identifiant idRef de l'auteur |  | 
| authors.isni | String | identifiant isni de l'auteur |  | 
| authors.orcId | String | identifiant orcId de l'auteur |  | 
| authors.researcherId | String | identifiant wos de l'auteur |  | 
| authors.surname | String | prénom de l'auteur |  | 
| authors.viaf | String | identifiant viaf de l'auteur |  | 
| bibCode | String | identifiant de document surtout en astronomie |  | 
| cern | String | identifiant du document du Cern |  | 
| creationDate | date | date de création de la notice | x | 
| documentType | String | type de document de la source |  | 
| doi | String | identifiant DOI du document |  | 
| duplicateRules | String | règles qui ont permis l'appariement | x | 
| duplicates.idConditor | String | idConditor de la notice qui a été appariée comme doublon certain | x | 
| duplicates.isValidatedByUser | Boolean | la notice a été validée ou non par un utilisateur (valeur True ou False) | x |
| duplicates.rules | String | règles qui ont permis l'appariement | x | 
| duplicates.sessionName | String | nom de la session : SOURCE_date d'ingestion | x | 
| duplicates.source | String | source de la notice qui a été appariée comme doublon certain | x | 
| eisbn | String | isbn électronique |  | 
| eissn | String | issn électronique |  | 
| electronicPublicationDate | String | date de publication (électronique) présente dans la notice source |  | 
| ensam | String | identifiant de document ensam (lien vers le document) |  | 
| first3AuthorNames | String | 3 premiers auteurs prénom complet ou initiale si la source propose uniquement l'initiale (utile au dédoublonnage) | x | 
| first3AuthorNamesWithInitials | String | 3 premiers auteurs initiale du prénom (utile au dédoublonnage) | x | 
| halAuthorId | String | liste des identifiants Hal des auteurs |  | 
| halId | String | identifiant du document Hal |  | 
| hasDoi | Boolean | présence ou non d'un DOI (valeur True ou False) | x | 
| hasTransDuplicate | Boolean | existence d'un doublon par transitivité (valeur True or False). Si A doublon de B et B doublon de C alors A est doublon de C | x | 
| idChain | String | ensemble des idConditors, préfixés par le nom de la source, des notices considérées comme doublons certains. Identifiants séparés par ! | x | 
| idConditor | String | identifiant du document Conditor créé aléatoirement | x | 
| idHal | String | liste des identifiants des auteurs Hal regroupant les halAuthorId |  | 
| idProdinra | String | identifiant du document ProdInra |  | 
| ineris | String | identifiant du document Ineris |  | 
| inspire | String | identifiant lié à des données géographiques |  | 
| ird | String | identifiant du document IRD |  | 
| irstea | String | identifiant du document IRSTEA |  | 
| isbn | String | isbn |  | 
| isDeduplicable | Boolean | la notice contient ou non les champs utiles au dédoublonnage (valeur True ou False) | x | 
| isDuplicate | Boolean | la notice est le doublon certain d'une ou plusieurs notices (valeur True ou False) | x | 
| isNearDuplicate | Boolean | la notice est le doublon incertain d'une ou plusieurs notices (valeur True ou False) | x | 
| isni | String | identifiant isni de l'auteur |  | 
| issn | String | issn |  | 
| issue | String | numéro du fascicule |  | 
| localRef | String |  |  | 
| meetingAbstractNumber | String | numéro du résumé de la conférence |  | 
| nearDuplicates.duplicateBySymmetry | Boolean | la notice est un doublon incertain par symétrie (valeur True) | x | 
| nearDuplicates.idConditor | String | idConditor de la notice qui a été appariée comme doublon incertain | x | 
| nearDuplicates.similarityRate | number | taux de similarité avec la notice appariée comme doublon incertain | x | 
| nearDuplicates.source | String | source de la notice appariée comme doublon incertain | x | 
| nearDuplicates.type | String | type Conditor du document source de la notice appariée comme doublon incertain | x | 
| nnt | String | identifiant des thèses |  | 
| oatao | String | identifiant du document de l'archive de Toulouse |  | 
| okina | String | identifiant du document de l'archive d'Angers |  | 
| orcId | String | liste des identifiants orcId des auteurs du document |  | 
| otherNumber | String | identifiant du document non repertorié par ailleurs |  | 
| pageRange | String | pagination |  | 
| part | String | partie d'un document |  | 
| patentNumber | String | identifiant brevet |  | 
| path | String | lien vers le document TEI Conditor | x | 
| pii | String | Publisher Item Identifier sont des identifiants d'articles/communications/chapitres créés par les sociétés savantes |  |
| pmc | String | identifiant du document texte intégral PubMedCentral |  | 
| pmId | String | identifiant du document notice PubMedCentral |  | 
| ppn | String | identifiant du document Sudoc |  | 
| publicationDate | String | date de publication (papier) présente dans la notice source |  | 
| publicationDate.date | date | version de type date de publicationDate. Créée à partir de cette dernière, elle se présente sous la forme de Mois Jour Année, heure:seconde:centième:millième | x | 
| reportNumber | String | numéro de rapport |  | 
| researcherId | String | identifiant WoS de l'auteur |  | 
| sciencespo | String | identifiant du document de Sciences Po |  | 
| sessionName | String | nom de la session : SOURCE_date d'ingestion | x | 
| source | String | source de la notice | x | 
| sourceId | String | identifiant du document source quelle que soit la source | x | 
| sourceUid | String | identifiant du document source quelle que soit la source préfixé de la source | x | 
| specialIssue | String | numéro spécial du fascicule |  | 
| supplement | String | numéro du supplément du fascicule |  | 
| teiBlob | unknown | TEI Conditor de la notice | x | 
| title.default | String | titre de l'article par défaut : titre anglais si pas d'autres titres, titre ni anglais ni français | x | 
| title.en | String | titre de l'article en anglais |  | 
| title.fr | String | titre de l'article en français |  | 
| title.journal | String | titre du périodique |  | 
| title.meeting | String | titre du congrès |  | 
| title.monography | String | titre de monographe |  | 
| typeConditor | String | type de document propre à Conditor pour repérer les doublons | x | 
| utKey | String | identifiant du document WoS |  | 
| viaf | String | identifiant d'auteur ou d'organisme |  | 
| volume | String | volume du fascicule |  | 
| xissn | String | regroupement des issn et des eissn | x | 
| xPublicationDate | String | regroupement des dates de publication papier et électronique présentes dans la notice source | x | 
