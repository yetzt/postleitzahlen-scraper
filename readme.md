# Postleitzahlen-Scraper

Ein Programm zum Erzuegen einer GeoJSON-Datei mit den offiziellen Postleitzahlengebieten in Deutschland.

## Anwendung

Zum Ausführen wird die [JavaScript-Laufzeitumgebung NodeJS](https://nodejs.org/de/) benötigt. Wenn diese installiert ist, wird das Script folgendermaßen ausgeführt:

`node postleitzahlen-scraper.js`

Durch diesen Aufruf werden zwei Dateien erzeugt: `postcodes.json` enthält eine Liste der aktuellen gebietsbezogenen Postleitzahlen, `postcodes.geojson` enthält die Umrisse der Postleitzahlengebiete im GeoJSON-Format.

## Zweck

Das Programm ermöglicht auch technisch Unversierten das Erstellen einer Privatkopie nach [§53 des Deutschen Urheberrechtsgesetz](https://www.gesetze-im-internet.de/urhg/__53.html).

Zweck diese Programmes ist zudem die Veranschaulichung des sogannenten "Scrapings" (dem maschinellen Zusammentragen von Daten), an Hand von Daten, [die der Allgemeinheit unter einer freien Lizenz zugänglich sein sollten](https://eur-lex.europa.eu/LexUriServ/LexUriServ.do?uri=OJ:L:2007:108:0001:0014:DE:PDF).

## Weiterführende Verweise

* [Deutsche Postleitzahlengebiete als Offene Daten](https://github.com/yetzt/postleitzahlen) — Zusammengetragen von den Beitragenden des OpenStreetMap-Projektes
