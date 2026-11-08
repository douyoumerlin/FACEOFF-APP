# FaceOff by GOAT225

Application d'arbitrage des duels 1v1 GOAT225 : joueurs, chrono, scores, fautes, vainqueur et historique.
Toutes les données restent sur l'appareil (aucun serveur, fonctionne hors ligne).

Le design suit la charte GOAT225 : bleu nuit `#12274A`, rouge `#E01B1B`, blanc, police Bebas Neue pour les titres
et Montserrat pour le texte. Les polices sont intégrées à l'application. Les logos sont dans `src/assets/brand/`.

## Développement (version web)

```bash
npm install
npm run dev
```

## Application Windows (Tauri)

L'application de bureau est générée avec [Tauri 2](https://tauri.app) à partir du même code.

### Sans PC Windows : GitHub Actions

1. Sur GitHub, onglet **Actions** › **Application Windows** › **Run workflow**.
2. À la fin du run, télécharger **FaceOff-Windows** dans la section *Artifacts* : il contient l'installateur `.exe` et le `.msi`.

Pour publier une version : créer un tag `v1.0.0` (par exemple) et le pousser. Un brouillon de *Release* GitHub est créé
avec les installateurs.

### Sur un PC Windows

Prérequis : [Node.js](https://nodejs.org), [Rust](https://rustup.rs) et les *Microsoft C++ Build Tools*.

```bash
npm install
npm run tauri build
```

Les installateurs sont générés dans `src-tauri/target/release/bundle/nsis/` et `src-tauri/target/release/bundle/msi/`.

### Mode Tournoi

Depuis la tuile **Tournoi** de l'accueil : choisis un format, coche les joueurs, lance.
Le tableau se met à jour tout seul après chaque match joué sur l'écran FaceOff.

- **A · Élimination directe** : arbre jusqu'à la finale (2 à 32 joueurs, exempts répartis automatiquement).
- **B · Poules + phase finale** : 1 poule (4-5 joueurs) ou 2 poules (6 à 16), les 2 premiers en phase finale.
- **C · Championnat** : tous contre tous, victoire 3 pts, nul 1 pt.

### Raccourcis clavier pendant un match

- `←` : un point pour le joueur 1
- `→` : un point pour le joueur 2
- `Espace` : lancer ou mettre en pause le chrono

### Icône

L'icône de l'application est générée depuis `app-icon.png` (logo GOAT225 sur fond bleu nuit) :

```bash
npx tauri icon app-icon.png
```
