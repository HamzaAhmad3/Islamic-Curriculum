# Fonts

All fonts in this directory are licensed under the SIL Open Font License 1.1
(see `OFL.txt`), which permits embedding, self-hosting, and redistribution
as part of this project, including on GitHub Pages.

| Font | Weight(s) | Source |
|---|---|---|
| Amiri | Regular, Bold | https://github.com/aliftype/amiri |
| Newsreader | Variable (200–800) | https://github.com/googlefonts/newsreader |
| Inter | Variable (100–900) | https://github.com/rsms/inter |

Files were converted from the Google Fonts repository's TTF sources to WOFF2
for smaller file size. To update or re-fetch a font, pull the latest TTF from
the corresponding `google/fonts` `ofl/<name>/` directory and re-run:

```
fonttools ttLib.woff2 compress -o <name>.woff2 <name>.ttf
```
