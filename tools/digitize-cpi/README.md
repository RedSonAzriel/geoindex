# CPI digitizer

Generates `src/data/realWellLogs.js` by tracing curves from the CPI figures in the
South Lokichar Basin Field Development Plan, Rev 6.2 (tabled in the Parliament of Kenya):
https://www.parliament.go.ke/sites/default/files/2025-11/South%20Lokichar%20Field%20Development%20Plan%20Rev%206.2%20(1).pdf

Wells: Ekales-2 (Fig 4-148), Etom-1 (Fig 4-157), Emekuya-1 (Fig 4-158), Agete-1 (Fig 4-168).

Steps:
1. Download the PDF and extract the figure images: `pdfimages -f <pdfpage> -l <pdfpage> -png fdp.pdf img/p<pdfpage>`
   (PDF pages 153, 162, 163, 171).
2. `python3 export.py` (needs numpy, Pillow, and tesseract for reading depth labels).

How it works: finds the track borders, reads the MD depth labels with OCR and fits depth to pixel row,
then traces each curve by colour (median x of matching pixels per row). Gaps up to 6 rows (~3 m) are
interpolated; longer gaps stay null. The source images are ~800x680 px, so the output is approximate.
