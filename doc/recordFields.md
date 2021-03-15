# Champs du JSON

Le JSON retourné par l'API Conditor est composé de champs extraits de la notice comme `title`, `issn`,  `first3AuthorNames`, mais aussi 
de champs à vocations techniques comme `idConditor`, `sessionName`, `isDuplicate`.

Liste des champs du JSON par ordre alphabétique :

| Champs      | Type    | Description                                | Champs Conditor                            | Nouveautés 2021 A venir                           |
| ----------- | ------- | ------------------------------------------ | ------------------------------------------ | ------------------------------------------ |
| _score | number | score d'ElasticSearch en fonction de la requête | x |  | 
| abstract | String | résumé en anglais |  | sera remplacé par abtract.en et abstract.fr |  
| abstract.en | String | résumé en anglais |  | x |  | 
| abstract.fr | String | résumé en français |  | x |  | 
| articleNumber | String | numéro d'article |  |  | 
| arxiv | String | identifiant du document arxiv |  |  | 
| authorNames | String | tous les noms prénoms d'auteurs sans séparateurs |  |  | 
| authors.affiliations.address | String | adresse de l'auteur |  |  | 
| authors.affiliations.idRef | String | identifiant idRef de la structure |  |  | 
| authors.affiliations.isni | String | identifiant isni de la structure |  |  | 
| authors.affiliations.ref | String | identifiant AuréHal de la structure |  |  | 
| authors.affiliations.rnsr | String | identifiant RNSR de la structure |  |  | 
| authors.enrichments.idHal | String | identifiant idHal de l'auteur attribué par alignement à partir des données idRef (équivalence idRef ou orcId avec idHal) | x | x | 
| authors.enrichments.idRef | String | identifiant idRef de l'auteur attribué par alignement à partir des données idRef (équivalence idHal ou orcId avec idRef) | x | x | 
| authors.enrichments.orcId | String | identifiant orcId de l'auteur attribué par alignement à partir des données idRef (équivalence idHal ou idRef avec orcId)| x | x | 
| authors.forename | String | prénom de l'auteur |  |  | 
| authors.halAuthorId | String | identifiant Hal de l'auteur |  |  | 
| authors.idHal | String | identifiant Hal de l'auteur regroupant les halAuthorId |  |  | 
| authors.idRef | String | identifiant idRef de l'auteur |  |  | 
| authors.isni | String | identifiant isni de l'auteur |  |  | 
| authors.orcId | String | identifiant orcId de l'auteur |  |  | 
| authors.researcherId | String | identifiant wos de l'auteur |  |  | 
| authors.surname | String | nom de l'auteur |  |  | 
| authors.viaf | String | identifiant viaf de l'auteur |  |  | 
| bibCode | String | identifiant de document surtout en astronomie |  |  | 
| cern | String | identifiant du document du Cern |  |  | 
| classification.dewey | String | code issu de la classification Dewey |  | x | 
| classification.hal | String | classification Hal |  | x | 
| classification.tef | String | code issu de la classification des thèses électroniques françaises |  | x | 
| classification.thesisDomain | String | verbalisation de la classification des thèses  |  | x | 
| creationDate | date | date de création de la notice | x |  | 
| defenseOrganisms.associatedLaboratory | String | laboratoire associé de l'organisme de soutenance |  | x | 
| defenseOrganisms.associatedLaboratoryIdRef | String | identifiant idRef du laboratoire associé de l'organisme de soutenance |  | x | 
| defenseOrganisms.degreeGrantor | String | organisme de soutenance |  | x | 
| defenseOrganisms.degreeGrantorIdRef | String | identifiant idRef de l'organisme de soutenance  |  | x | 
| defenseOrganisms.doctoralSchool | String | école doctorale de l'organisme de soutenance |  | x | 
| defenseOrganisms.doctoralSchoolIdRef | String | identifiant idRef de l'école doctorale de l'organisme de soutenance |  | x | 
| documentType | String | type de document de la source |  |  | 
| doi | String | identifiant DOI du document |  |  | 
| duplicateRules | String | règles qui ont permis l'appariement | x |  | 
| duplicates.idConditor | String | idConditor de la notice qui a été appariée comme doublon certain | x |  | 
| duplicates.isValidatedByUser | Boolean | la notice a été validée ou non par un utilisateur (valeur True ou False) | x |  |
| duplicates.rules | String | règles qui ont permis l'appariement | x |  | 
| duplicates.sessionName | String | nom de la session : SOURCE_date d'ingestion | x |  | 
| duplicates.source | String | source de la notice qui a été appariée comme doublon certain | x |  |
| duplicates.sourceUid | String | identifiant source de la notice qui a été appariée comme doublon certain | x | x |
| editor.forename | String | prénom de l'éditeur scientifique |  | x |
| editor.idRef | String | identifiant idRef de l'éditeur scientifique |  | x |
| editor.surname | String | nom de l'éditeur scientifique |  | x |   
| eisbn | String | isbn électronique |  |  | 
| eissn | String | issn électronique |  |  | 
| electronicPublicationDate | String | date de publication (électronique) présente dans la notice source |  |  |
| enrichments.classifications.bso | String | classification issue du BSO à partir du DOI| x | x |
| enrichments.classifications.scienceMetrix.level | String | niveau de la classification issue de Science Metrix à partir de l'ISSN| x | x |
| enrichments.classifications.scienceMetrix.value | String | valeur de la classification issue de Science Metrix à partir de l'ISSN| x | x |
| enrichments.classifications.scopus.level | String | niveau de la classification issue de Scopus à partir de l'ISSN | x | x |
| enrichments.classifications.scopus.value | String | valeur de la classification issue de Scopus à partir de l'ISSN | x | x |
| enrichments.oa.core | String | mention d'Open Access d'après Core | x | x |
| enrichments.oa.unpaywall | String | mention d'Open Access d'après Unpaywall | x | x |
| ensam | String | identifiant de document ensam (lien vers le document) |  |  | 
| first3AuthorNames | String | 3 premiers auteurs prénom complet ou initiale si la source propose uniquement l'initiale (utile au dédoublonnage) | x |  | 
| first3AuthorNamesWithInitials | String | 3 premiers auteurs initiale du prénom (utile au dédoublonnage) | x |  | 
| fulltextPath | String | chemin ver le texte intégral |  |  | 
| funders.grantNumber | String | numéro du financement |  | x | 
| funders.name | String | nom du financeur |  | x |
| halAuthorId | String | liste des identifiants Hal des auteurs |  |  | 
| halId | String | identifiant du document Hal |  |  | 
| hasDoi | Boolean | présence ou non d'un DOI (valeur True ou False) | x |  | 
| hasFulltext | String | présence ou non du texte intégral |  | x | 
| hasTransDuplicate | Boolean | existence d'un doublon par transitivité (valeur True or False). Si A doublon de B et B doublon de C alors A est doublon de C | x |  | 
| idChain | String | ensemble des idConditors, préfixés par le nom de la source, des notices considérées comme doublons certains. Identifiants séparés par ! | x |  | 
| idConditor | String | identifiant du document Conditor créé aléatoirement | x |  | 
| idHal | String | liste des identifiants des auteurs Hal regroupant les halAuthorId |  |  | 
| idProdinra | String | identifiant du document ProdInra |  |  | 
| ineris | String | identifiant du document Ineris |  |  | 
| inspire | String | identifiant lié à des données géographiques |  |  | 
| ird | String | identifiant du document IRD |  |  | 
| irstea | String | identifiant du document IRSTEA |  |  | 
| isbn | String | isbn |  |  | 
| isDeduplicable | Boolean | la notice contient ou non les champs utiles au dédoublonnage (valeur True ou False) | x |  | 
| isDuplicate | Boolean | la notice est le doublon certain d'une ou plusieurs notices (valeur True ou False) | x |  | 
| isNearDuplicate | Boolean | la notice est le doublon incertain d'une ou plusieurs notices (valeur True ou False) | x |  | 
| isni | String | identifiant isni de l'auteur |  |  | 
| issn | String | issn |  |  | 
| issue | String | numéro du fascicule |  |  |
| keywords.en.author | String | mots-clés auteurs en anglais |  | x |
| keywords.en.mesh | String | mots-clés du Mesh en anglais |  | x |
| keywords.fr.author | String | mots-clés auteurs en français |  | x |
| keywords.fr.rameau | String | termes Rameau en français |  | x |
| keywords.undetermined.author | String | mots-clés auteurs sans langue |  | x | 
| keywords.undetermined.mesh | String | mots-clés du Mesh sans langue |  | x |
| language | String | langue du document |  | x |         
| localRef | String |  |  |  | 
| meetingAbstractNumber | String | numéro du résumé de la conférence |  |  | 
| nearDuplicates.duplicateBySymmetry | Boolean | la notice est un doublon incertain par symétrie (valeur True) | x |  | 
| nearDuplicates.idConditor | String | idConditor de la notice qui a été appariée comme doublon incertain | x |  | 
| nearDuplicates.similarityRate | number | taux de similarité avec la notice appariée comme doublon incertain | x |  | 
| nearDuplicates.source | String | source de la notice appariée comme doublon incertain | x |  |
| nearDuplicates.sourceUid | String | identifiant source de la notice appariée comme doublon incertain | x | x |  
| nearDuplicates.type | String | type Conditor du document source de la notice appariée comme doublon incertain | x |  | 
| nearDuplicatesDetectedBySimilarity.duplicateBySymmetry | boolean | doublon incertain par symétrie | x |  |
| nearDuplicatesDetectedBySimilarity.idConditor | String | idConditor du doublon incertain par symétrie | x |  |
| nearDuplicatesDetectedBySimilarity.similarityRate | number | taux de similarité du doublon incertain par symétrie | x |  |
| nearDuplicatesDetectedBySimilarity.source | String | source du doublon incertain par symétrie | x |  |
| nearDuplicatesDetectedBySimilarity.sourceUid | String | identifiant source du doublon incertain par symétrie | x | x |
| nearDuplicatesDetectedBySimilarity.type | String | type de document Conditor du doublon incertain par symétrie | x |  |
| nnt | String | identifiant des thèses |  |  | 
| oatao | String | identifiant du document de l'archive de Toulouse |  |  | 
| okina | String | identifiant du document de l'archive d'Angers |  |  | 
| orcId | String | liste des identifiants orcId des auteurs du document |  |  | 
| otherNumber | String | identifiant du document non repertorié par ailleurs |  |  | 
| pageRange | String | pagination |  |  | 
| part | String | partie d'un document |  |  | 
| patentNumber | String | identifiant brevet |  |  | 
| path | String | lien vers le document TEI Conditor | x |  | 
| pii | String | Publisher Item Identifier sont des identifiants d'articles/communications/chapitres créés par les sociétés savantes |  |  |
| pmc | String | identifiant du document texte intégral PubMedCentral |  |  | 
| pmId | String | identifiant du document notice PubMedCentral |  |  | 
| ppn | String | identifiant du document Sudoc |  |  | 
| publicationDate | String | date de publication (papier) présente dans la notice source |  |  | 
| publicationDate.date | date | version de type date de publicationDate. Créée à partir de cette dernière, elle se présente sous la forme de Mois Jour Année, heure:seconde:centième:millième | x |  |
| publisher | String | éditeur |  | x |  
| publishingDirector.forename | String | prénom du directeur de publication |  | x | 
| publishingDirector.idRef | String | identifiant idRef du directeur de publication |  | x | 
| publishingDirector.surname | String | nom du directeur de publication |  | x | 
| reportNumber | String | numéro de rapport |  |  | 
| researcherId | String | identifiant WoS de l'auteur |  |  | 
| rnsr | String | code RNSR de la notice initiale |  | x |
| sciencespo | String | identifiant du document de Sciences Po |  |  | 
| sessionName | String | nom de la session : SOURCE_date d'ingestion | x |  | 
| source | String | source de la notice | x |  | 
| sourceId | String | identifiant du document source quelle que soit la source | x |  | 
| sourceUid | String | identifiant du document source quelle que soit la source préfixé de la source | x |  | 
| specialIssue | String | numéro spécial du fascicule |  |  | 
| supplement | String | numéro du supplément du fascicule |  |  | 
| teiBlob | unknown | TEI Conditor de la notice | x |  | 
| thesisAdvisor.forename | String | prénom du directeur de thèse |  | x |
| thesisAdvisor.idRef | String | identifiant idRef du directeur de thèse |  | x |
| thesisAdvisor.surname | String | nom du directeur de thèse |  | x |   
| title.default | String | titre de l'article par défaut : titre anglais si pas d'autres titres, titre ni anglais ni français | x |  | 
| title.en | String | titre de l'article en anglais |  |  | 
| title.fr | String | titre de l'article en français |  |  | 
| title.journal | String | titre du périodique |  |  | 
| title.meeting | String | titre du congrès |  |  | 
| title.monography | String | titre de monographe |  |  | 
| typeConditor | String | type de document propre à Conditor pour repérer les doublons | x |  | 
| utKey | String | identifiant du document WoS |  |  | 
| viaf | String | identifiant d'auteur ou d'organisme |  |  | 
| volume | String | volume du fascicule |  |  | 
| xissn | String | regroupement des issn et des eissn | x |  | 
| xPublicationDate | String | regroupement des dates de publication papier et électronique présentes dans la notice source | x |  | 
