#!/bin/bash
# Generate JPG thumbnails from PDF certificates
THUMB_DIR="thumbnails"

for dir in "public/certificates-tech" "public/certificates-otros"; do
  mkdir -p "$dir/$THUMB_DIR"
  for pdf in "$dir"/*.pdf; do
    [ -f "$pdf" ] || continue
    base=$(basename "$pdf" .pdf)
    out="$dir/$THUMB_DIR/$base.jpg"
    if [ ! -f "$out" ]; then
      echo "Converting: $pdf -> $out"
      gs -dNOPAUSE -dBATCH -sDEVICE=jpeg -r72 \
        -dFirstPage=1 -dLastPage=1 \
        -dTextAlphaBits=4 -dGraphicsAlphaBits=4 \
        -sOutputFile="$out" "$pdf" 2>/dev/null
    else
      echo "Skip existing: $out"
    fi
  done
done

echo "Done!"
